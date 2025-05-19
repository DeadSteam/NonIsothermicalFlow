package com.example.nonisothermicalflow.admin.service;

import com.example.nonisothermicalflow.admin.config.DatabaseCredentialsConfig;
import com.example.nonisothermicalflow.admin.model.DatabaseBackup;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Сервис для управления резервными копиями базы данных
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class DatabaseBackupService {

    private final DatabaseCredentialsConfig dbConfig;

    @Value("${backup.directory:./db_backups}")
    private String backupDirectory;

    private static final DateTimeFormatter FILE_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    /**
     * Получение списка всех резервных копий
     *
     * @return список резервных копий
     */
    public List<DatabaseBackup> getAllBackups() {
        try {
            File backupDir = new File(backupDirectory);
            if (!backupDir.exists()) {
                log.info("Директория бэкапов не существует, создаем: {}", backupDirectory);
                backupDir.mkdirs();
                return Collections.emptyList();
            }

            File[] files = backupDir.listFiles();
            if (files == null) {
                log.warn("Не удалось получить список файлов из директории {}", backupDirectory);
                return Collections.emptyList();
            }

            log.info("Найдено {} файлов в директории {}", files.length, backupDirectory);
            return Arrays.stream(files)
                    .filter(File::isFile)
                    .filter(file -> file.getName().endsWith(".sql"))
                    .map(this::mapToBackup)
                    .sorted(Comparator.comparing(DatabaseBackup::getCreatedAt).reversed())
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Ошибка при получении списка резервных копий", e);
            return Collections.emptyList();
        }
    }

    /**
     * Создание резервной копии базы данных
     *
     * @return созданная резервная копия
     * @throws IOException при ошибке создания файла
     */
    public List<DatabaseBackup> createBackup() throws IOException {
        // Проверяем наличие утилиты pg_dump
        if (!isPgDumpAvailable()) {
            throw new IOException("Утилита pg_dump не найдена в системе. Убедитесь, что PostgreSQL установлен и доступен в PATH.");
        }
        
        File backupDir = new File(backupDirectory);
        if (!backupDir.exists()) {
            log.info("Создание директории для бэкапов: {}", backupDirectory);
            boolean created = backupDir.mkdirs();
            if (!created) {
                throw new IOException("Не удалось создать директорию для резервных копий: " + backupDirectory);
            }
        }
        
        if (!backupDir.canWrite()) {
            throw new IOException("Нет прав на запись в директорию для резервных копий: " + backupDirectory);
        }

        List<DatabaseBackup> createdBackups = new ArrayList<>();
        
        try {
            // Создание резервной копии для базы данных materials
            log.info("Начинаем создание бэкапа базы данных materials");
            createBackupForDatabase(
                    dbConfig.getMaterialsDbName(),
                    dbConfig.getMaterialsDbHost(),
                    dbConfig.getMaterialsDbPort(),
                    dbConfig.getMaterialsDbUsername(),
                    dbConfig.getMaterialsDbPassword(),
                    createdBackups
            );
            
            // Создание резервной копии для базы данных users
            log.info("Начинаем создание бэкапа базы данных users");
            createBackupForDatabase(
                    dbConfig.getUsersDbName(),
                    dbConfig.getUsersDbHost(),
                    dbConfig.getUsersDbPort(),
                    dbConfig.getUsersDbUsername(),
                    dbConfig.getUsersDbPassword(),
                    createdBackups
            );
            
            return createdBackups;
        } catch (Exception e) {
            log.error("Ошибка при создании резервных копий", e);
            throw new IOException("Не удалось создать резервные копии: " + e.getMessage(), e);
        }
    }

    /**
     * Получение резервной копии по идентификатору
     *
     * @param id идентификатор резервной копии
     * @return резервная копия
     * @throws IllegalArgumentException если копия не найдена
     */
    public DatabaseBackup getBackupById(UUID id) throws IllegalArgumentException {
        return getAllBackups().stream()
                .filter(backup -> backup.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Резервная копия с ID " + id + " не найдена"));
    }

    /**
     * Получение файла резервной копии
     *
     * @param id идентификатор резервной копии
     * @return файл резервной копии
     * @throws IOException если файл не найден
     */
    public Resource getBackupFile(UUID id) throws IOException {
        DatabaseBackup backup = getBackupById(id);
        Path filePath = Paths.get(backupDirectory, backup.getFilename());
        Resource resource = new UrlResource(filePath.toUri());

        if (resource.exists() || resource.isReadable()) {
            return resource;
        } else {
            throw new IOException("Файл резервной копии не найден или не может быть прочитан");
        }
    }

    /**
     * Восстановление базы данных из резервной копии
     *
     * @param id идентификатор резервной копии
     * @throws IOException                  при ошибке чтения файла
     * @throws IllegalArgumentException     при ошибке валидации
     */
    public void restoreBackup(UUID id) throws IOException, IllegalArgumentException {
        // Проверяем наличие утилиты psql
        if (!isPsqlAvailable()) {
            throw new IOException("Утилита psql не найдена в системе. Убедитесь, что PostgreSQL установлен и доступен в PATH.");
        }
        
        DatabaseBackup backup = getBackupById(id);
        Path backupPath = Paths.get(backupDirectory, backup.getFilename());
        
        if (!Files.exists(backupPath)) {
            throw new IOException("Файл резервной копии не найден: " + backup.getFilename());
        }
        
        String database = backup.getDatabase();
        String host, port, username, password;
        
        if (database.equals(dbConfig.getMaterialsDbName())) {
            host = dbConfig.getMaterialsDbHost();
            port = dbConfig.getMaterialsDbPort();
            username = dbConfig.getMaterialsDbUsername();
            password = dbConfig.getMaterialsDbPassword();
        } else if (database.equals(dbConfig.getUsersDbName())) {
            host = dbConfig.getUsersDbHost();
            port = dbConfig.getUsersDbPort();
            username = dbConfig.getUsersDbUsername();
            password = dbConfig.getUsersDbPassword();
        } else {
            throw new IllegalArgumentException("Неизвестная база данных: " + database);
        }
        
        log.info("Восстановление базы данных {} из файла {}", database, backupPath.toString());
        
        try {
            // Выполняем команду восстановления через psql
            ProcessBuilder processBuilder = new ProcessBuilder(
                    "psql", 
                    "-h", host, 
                    "-p", port, 
                    "-U", username, 
                    "-d", database, 
                    "-f", backupPath.toString()
            );
            
            processBuilder.environment().put("PGPASSWORD", password);
            processBuilder.redirectErrorStream(true);
            
            Process process = processBuilder.start();
            
            // Читаем вывод процесса для диагностики
            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }
            
            int exitCode = process.waitFor();
            
            if (exitCode != 0) {
                log.error("Ошибка при восстановлении базы данных. Код выхода: {}. Вывод: {}", exitCode, output.toString());
                throw new IOException("Ошибка восстановления базы данных. Код выхода: " + exitCode + ". Проверьте логи сервера.");
            }
            
            log.info("База данных {} успешно восстановлена из резервной копии {}", database, backup.getFilename());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Процесс восстановления базы данных был прерван", e);
        }
    }

    /**
     * Преобразование файла в модель резервной копии
     *
     * @param file файл резервной копии
     * @return модель резервной копии
     */
    private DatabaseBackup mapToBackup(File file) {
        String filename = file.getName();
        String database = extractDatabaseName(filename);
        LocalDateTime createdAt = extractCreationDate(filename);

        return DatabaseBackup.builder()
                .id(UUID.nameUUIDFromBytes(filename.getBytes()))
                .filename(filename)
                .size(file.length())
                .createdAt(createdAt)
                .database(database)
                .build();
    }

    /**
     * Извлечение имени базы данных из имени файла
     * 
     * @param filename имя файла
     * @return имя базы данных
     */
    private String extractDatabaseName(String filename) {
        if (filename.contains(dbConfig.getMaterialsDbName())) {
            return dbConfig.getMaterialsDbName();
        } else if (filename.contains(dbConfig.getUsersDbName())) {
            return dbConfig.getUsersDbName();
        }
        return "unknown";
    }

    /**
     * Извлечение даты создания из имени файла
     * 
     * @param filename имя файла
     * @return дата создания
     */
    private LocalDateTime extractCreationDate(String filename) {
        try {
            // Предполагаем формат имени файла: db_name_YYYYMMDD_HHMMSS.sql
            String dateTimeStr = filename.replaceAll("^.*_(\\d{8}_\\d{6})\\.sql$", "$1");
            return LocalDateTime.parse(dateTimeStr, FILE_DATE_FORMAT);
        } catch (Exception e) {
            // Если не удалось извлечь дату, используем время последней модификации файла
            return LocalDateTime.now();
        }
    }

    /**
     * Создание резервной копии для конкретной базы данных
     * 
     * @param dbName имя базы данных
     * @param host имя хоста
     * @param port порт
     * @param username имя пользователя
     * @param password пароль
     * @param createdBackups список созданных резервных копий
     * @throws IOException при ошибке создания файла
     */
    private void createBackupForDatabase(String dbName, String host, String port, String username, String password, List<DatabaseBackup> createdBackups) throws IOException {
        String timestamp = FILE_DATE_FORMAT.format(LocalDateTime.now());
        String filename = dbName + "_" + timestamp + ".sql";
        Path backupPath = Paths.get(backupDirectory, filename);
        
        log.info("Создание резервной копии БД {} в файл {}", dbName, backupPath.toString());
        
        try {
            ProcessBuilder processBuilder = new ProcessBuilder(
                    "pg_dump",
                    "-h", host,
                    "-p", port,
                    "-U", username,
                    "-F", "p",  // plain text format
                    "-f", backupPath.toString(),
                    dbName
            );
            
            processBuilder.environment().put("PGPASSWORD", password);
            processBuilder.redirectErrorStream(true);
            
            Process process = processBuilder.start();
            
            // Читаем вывод процесса для диагностики
            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                    log.debug("pg_dump output: {}", line);
                }
            }
            
            int exitCode = process.waitFor();
            
            if (exitCode != 0) {
                log.error("Ошибка создания резервной копии. Код выхода: {}. Вывод: {}", exitCode, output.toString());
                throw new IOException("Ошибка создания резервной копии. Код выхода: " + exitCode + ". Проверьте логи сервера.");
            }
            
            File backupFile = backupPath.toFile();
            if (!backupFile.exists() || backupFile.length() == 0) {
                log.error("Файл резервной копии не создан или пуст: {}", backupPath);
                throw new IOException("Файл резервной копии не создан или пуст: " + backupPath);
            }
            
            DatabaseBackup backup = mapToBackup(backupFile);
            createdBackups.add(backup);
            
            log.info("Успешно создана резервная копия базы данных {}: {}", dbName, filename);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Процесс создания резервной копии был прерван", e);
        }
    }
    
    /**
     * Проверка наличия утилиты pg_dump
     * 
     * @return true если утилита доступна
     */
    private boolean isPgDumpAvailable() {
        try {
            Process process = new ProcessBuilder("pg_dump", "--version")
                    .redirectErrorStream(true)
                    .start();
            
            int exitCode = process.waitFor();
            return exitCode == 0;
        } catch (IOException | InterruptedException e) {
            log.warn("Утилита pg_dump не найдена: {}", e.getMessage());
            if (e instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            return false;
        }
    }
    
    /**
     * Проверка наличия утилиты psql
     * 
     * @return true если утилита доступна
     */
    private boolean isPsqlAvailable() {
        try {
            Process process = new ProcessBuilder("psql", "--version")
                    .redirectErrorStream(true)
                    .start();
            
            int exitCode = process.waitFor();
            return exitCode == 0;
        } catch (IOException | InterruptedException e) {
            log.warn("Утилита psql не найдена: {}", e.getMessage());
            if (e instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            return false;
        }
    }
} 
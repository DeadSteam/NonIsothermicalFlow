package com.example.nonisothermicalflow.admin.service;

import com.example.nonisothermicalflow.admin.model.DatabaseBackup;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
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
 * Сервис для управления резервными копиями базы данных с использованием Docker
 */
@Service
@Primary
@Slf4j
@RequiredArgsConstructor
public class DockerDatabaseBackupService {
    
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
     * @return список созданных резервных копий
     * @throws IOException при ошибке создания файла
     */
    public List<DatabaseBackup> createBackup() throws IOException {
        // Проверяем наличие Docker
        if (!isDockerAvailable()) {
            throw new IOException("Docker не найден в системе. Убедитесь, что Docker установлен и запущен.");
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

        Path absoluteBackupPath = backupDir.toPath().toAbsolutePath();
        log.info("Полный путь к директории бэкапов: {}", absoluteBackupPath);

        List<DatabaseBackup> createdBackups = new ArrayList<>();
        
        try {
            // Создаем резервную копию для базы данных materials
            log.info("Начинаем создание бэкапа базы данных materials_db");
            createBackupForDatabase("postgres-materials", "materials_db", "postgres", "Akrawer1", createdBackups);
            
            // Создаем резервную копию для базы данных users
            log.info("Начинаем создание бэкапа базы данных users_db");
            createBackupForDatabase("postgres-users", "users_db", "postgres", "Akrawer1", createdBackups);
            
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
        // Проверяем наличие Docker
        if (!isDockerAvailable()) {
            throw new IOException("Docker не найден в системе. Убедитесь, что Docker установлен и запущен.");
        }
        
        DatabaseBackup backup = getBackupById(id);
        Path backupPath = Paths.get(backupDirectory, backup.getFilename()).toAbsolutePath();
        
        if (!Files.exists(backupPath)) {
            throw new IOException("Файл резервной копии не найден: " + backup.getFilename());
        }
        
        String database = backup.getDatabase();
        String containerName;
        String username = "postgres";
        String password = "Akrawer1";
        
        if (database.equals("materials_db")) {
            containerName = "postgres-materials";
        } else if (database.equals("users_db")) {
            containerName = "postgres-users";
        } else {
            throw new IllegalArgumentException("Неизвестная база данных: " + database);
        }
        
        log.info("Восстановление базы данных {} из файла {}", database, backupPath);
        
        try {
            // Копируем файл бэкапа в контейнер
            String backupFile = "/tmp/" + backup.getFilename();
            ProcessBuilder copyProcess = new ProcessBuilder(
                "docker", "cp", backupPath.toString(), containerName + ":" + backupFile
            );
            
            log.info("Копирование файла в контейнер: {}", copyProcess.command());
            copyProcess.redirectErrorStream(true);
            Process copyProc = copyProcess.start();
            
            // Читаем вывод процесса копирования для диагностики
            StringBuilder copyOutput = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(copyProc.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    copyOutput.append(line).append("\n");
                    log.debug("Copy output: {}", line);
                }
            }
            
            int copyExitCode = copyProc.waitFor();
            
            if (copyExitCode != 0) {
                log.error("Ошибка при копировании файла бэкапа в контейнер. Код выхода: {}, вывод: {}", 
                         copyExitCode, copyOutput);
                throw new IOException("Ошибка при копировании файла бэкапа в контейнер. Код выхода: " + copyExitCode);
            }
            
            // Проверяем размер скопированного файла в контейнере
            ProcessBuilder checkFileProcess = new ProcessBuilder(
                "docker", "exec", containerName, "ls", "-l", backupFile
            );
            
            log.info("Проверка файла в контейнере: {}", checkFileProcess.command());
            checkFileProcess.redirectErrorStream(true);
            Process checkProc = checkFileProcess.start();
            
            StringBuilder checkOutput = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(checkProc.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    checkOutput.append(line).append("\n");
                    log.debug("Check file output: {}", line);
                }
            }
            
            int checkExitCode = checkProc.waitFor();
            log.info("Результат проверки файла: {} (код: {})", checkOutput, checkExitCode);
            
            // Восстанавливаем базу данных
            // Сначала очищаем базу данных для избежания конфликтов
            ProcessBuilder clearDbProcess = new ProcessBuilder(
                "docker", "exec", containerName,
                "psql", "-U", username, "-d", database, "-c", "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
            );
            
            Map<String, String> clearEnvironment = clearDbProcess.environment();
            clearEnvironment.put("PGPASSWORD", password);
            clearDbProcess.redirectErrorStream(true);
            
            log.info("Очистка базы данных перед восстановлением: {}", clearDbProcess.command());
            Process clearProc = clearDbProcess.start();
            
            StringBuilder clearOutput = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(clearProc.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    clearOutput.append(line).append("\n");
                    log.debug("Clear DB output: {}", line);
                }
            }
            
            int clearExitCode = clearProc.waitFor();
            log.info("Результат очистки базы данных: код {}. Вывод: {}", clearExitCode, clearOutput);
            
            // Теперь восстанавливаем базу данных
            ProcessBuilder restoreProcess = new ProcessBuilder(
                "docker", "exec", containerName,
                "psql", "-U", username, "-d", database, "-f", backupFile
            );
            
            Map<String, String> environment = restoreProcess.environment();
            environment.put("PGPASSWORD", password);
            restoreProcess.redirectErrorStream(true);
            
            log.info("Восстановление базы данных: {}", restoreProcess.command());
            Process restoreProc = restoreProcess.start();
            
            // Читаем вывод процесса для диагностики
            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(restoreProc.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                    log.debug("Restore output: {}", line);
                }
            }
            
            int restoreExitCode = restoreProc.waitFor();
            
            if (restoreExitCode != 0) {
                log.error("Ошибка при восстановлении базы данных. Код выхода: {}. Вывод: {}", restoreExitCode, output);
                throw new IOException("Ошибка восстановления базы данных. Код выхода: " + restoreExitCode);
            }
            
            log.info("База данных {} успешно восстановлена из резервной копии {}", database, backup.getFilename());
            
            // Удаляем временный файл из контейнера
            ProcessBuilder cleanupProcess = new ProcessBuilder(
                "docker", "exec", containerName, "rm", backupFile
            );
            
            cleanupProcess.start();
            
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
        if (filename.contains("materials_db")) {
            return "materials_db";
        } else if (filename.contains("users_db")) {
            return "users_db";
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
     * @param containerName имя Docker-контейнера
     * @param dbName имя базы данных
     * @param username имя пользователя
     * @param password пароль
     * @param createdBackups список созданных резервных копий
     * @throws IOException при ошибке создания файла
     */
    private void createBackupForDatabase(String containerName, String dbName, String username, String password, 
                                         List<DatabaseBackup> createdBackups) throws IOException {
        String timestamp = FILE_DATE_FORMAT.format(LocalDateTime.now());
        String filename = dbName + "_" + timestamp + ".sql";
        Path backupPath = Paths.get(backupDirectory, filename).toAbsolutePath();
        
        log.info("Создание резервной копии БД {} через Docker в файл {}", dbName, backupPath);
        
        try {
            ProcessBuilder processBuilder = new ProcessBuilder(
                "docker", "exec", containerName,
                "pg_dump", "-U", username, "--no-owner", "--no-acl", dbName
            );
            
            Map<String, String> environment = processBuilder.environment();
            environment.put("PGPASSWORD", password);
            
            Path parentDir = backupPath.getParent();
            if (parentDir != null && !Files.exists(parentDir)) {
                Files.createDirectories(parentDir);
            }
            
            processBuilder.redirectOutput(backupPath.toFile());
            processBuilder.redirectErrorStream(true);
            
            log.info("Выполнение команды: {}", processBuilder.command());
            
            Process process = processBuilder.start();
            int exitCode = process.waitFor();
            
            if (exitCode != 0) {
                log.error("Ошибка создания резервной копии. Код выхода: {}", exitCode);
                throw new IOException("Ошибка создания резервной копии. Код выхода: " + exitCode);
            }
            
            File backupFile = backupPath.toFile();
            if (!backupFile.exists() || backupFile.length() == 0) {
                log.error("Файл резервной копии не создан или пуст: {}", backupPath);
                throw new IOException("Файл резервной копии не создан или пуст: " + backupPath);
            }
            
            DatabaseBackup backup = mapToBackup(backupFile);
            createdBackups.add(backup);
            
            log.info("Успешно создана резервная копия базы данных {}: {} (размер: {} байт)", 
                    dbName, filename, backupFile.length());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Процесс создания резервной копии был прерван", e);
        }
    }
    
    /**
     * Проверка доступности Docker
     * 
     * @return true если Docker доступен
     */
    private boolean isDockerAvailable() {
        try {
            Process process = new ProcessBuilder("docker", "--version")
                    .redirectErrorStream(true)
                    .start();
            
            int exitCode = process.waitFor();
            
            if (exitCode != 0) {
                log.warn("Docker недоступен, код выхода: {}", exitCode);
                return false;
            }
            
            log.info("Docker доступен");
            return true;
        } catch (IOException | InterruptedException e) {
            log.warn("Docker недоступен: {}", e.getMessage());
            if (e instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            return false;
        }
    }

    /**
     * Удаление резервной копии
     *
     * @param id идентификатор резервной копии
     * @throws IOException при ошибке удаления файла
     * @throws IllegalArgumentException если копия не найдена
     */
    public void deleteBackup(UUID id) throws IOException, IllegalArgumentException {
        // Получаем информацию о резервной копии
        DatabaseBackup backup = getBackupById(id);
        Path backupPath = Paths.get(backupDirectory, backup.getFilename());
        
        log.info("Удаление резервной копии: {}", backupPath);
        
        // Проверяем существование файла
        if (!Files.exists(backupPath)) {
            throw new IOException("Файл резервной копии не найден: " + backup.getFilename());
        }
        
        // Удаляем файл
        try {
            Files.delete(backupPath);
            log.info("Резервная копия {} успешно удалена", backup.getFilename());
        } catch (IOException e) {
            log.error("Ошибка при удалении файла резервной копии: {}", e.getMessage());
            throw new IOException("Ошибка при удалении файла резервной копии: " + e.getMessage(), e);
        }
    }
} 
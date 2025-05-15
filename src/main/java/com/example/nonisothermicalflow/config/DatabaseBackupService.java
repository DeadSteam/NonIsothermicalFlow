package com.example.nonisothermicalflow.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DatabaseBackupService {
    
    private static final Logger logger = LoggerFactory.getLogger(DatabaseBackupService.class);
    
    @Value("${spring.datasource.materials.url}")
    private String materialsDbUrl;
    
    @Value("${spring.datasource.materials.username}")
    private String materialsDbUsername;
    
    @Value("${spring.datasource.materials.password}")
    private String materialsDbPassword;
    
    @Value("${spring.datasource.users.url}")
    private String usersDbUrl;
    
    @Value("${spring.datasource.users.username}")
    private String usersDbUsername;
    
    @Value("${spring.datasource.users.password}")
    private String usersDbPassword;
    
    private final String backupDir = "db-backups";
    
    public DatabaseBackupService() {
        // Создаем директорию для бэкапов, если она не существует
        File dir = new File(backupDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }
        
        // Проверяем наличие необходимых утилит
        try {
            checkPostgresTools();
        } catch (IOException e) {
            logger.error("Ошибка при проверке инструментов PostgreSQL: {}", e.getMessage());
        }
    }
    
    /**
     * Проверяет наличие необходимых инструментов PostgreSQL
     */
    private void checkPostgresTools() throws IOException {
        try {
            Process process = Runtime.getRuntime().exec("pg_dump --version");
            int exitCode = process.waitFor();
            if (exitCode == 0) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
                String version = reader.readLine();
                logger.info("Обнаружен pg_dump: {}", version);
            } else {
                logger.error("pg_dump не найден или не может быть выполнен");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Проверка pg_dump была прервана", e);
        } catch (IOException e) {
            logger.error("pg_dump не найден: {}", e.getMessage());
            throw new IOException("pg_dump не найден в системе. Убедитесь, что PostgreSQL установлен и инструменты доступны в PATH", e);
        }
        
        try {
            Process process = Runtime.getRuntime().exec("psql --version");
            int exitCode = process.waitFor();
            if (exitCode == 0) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
                String version = reader.readLine();
                logger.info("Обнаружен psql: {}", version);
            } else {
                logger.error("psql не найден или не может быть выполнен");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Проверка psql была прервана", e);
        } catch (IOException e) {
            logger.error("psql не найден: {}", e.getMessage());
            throw new IOException("psql не найден в системе. Убедитесь, что PostgreSQL установлен и инструменты доступны в PATH", e);
        }
    }
    
    /**
     * Создает резервную копию обеих баз данных: materials_db и users_db
     * @return имя созданной резервной копии
     */
    public String createBackup() throws IOException {
        String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        String backupName = "backup_" + timestamp;
        String backupPath = backupDir + "/" + backupName;
        
        // Создаем директорию для текущего бэкапа
        File backupDir = new File(backupPath);
        if (!backupDir.mkdirs()) {
            throw new IOException("Не удалось создать директорию для резервной копии: " + backupPath);
        }
        
        logger.info("Создаем резервную копию в директории: {}", backupPath);
        
        try {
            // Извлекаем имя базы данных из URL
            String materialsDbName = extractDatabaseName(materialsDbUrl);
            String usersDbName = extractDatabaseName(usersDbUrl);
            
            logger.info("Создаем резервную копию базы данных материалов: {}", materialsDbName);
            backupDatabase(materialsDbName, materialsDbUsername, materialsDbPassword, backupPath + "/materials_db.sql");
            
            logger.info("Создаем резервную копию базы данных пользователей: {}", usersDbName);
            backupDatabase(usersDbName, usersDbUsername, usersDbPassword, backupPath + "/users_db.sql");
            
            logger.info("Резервная копия успешно создана: {}", backupName);
            return backupName;
        } catch (Exception e) {
            // В случае ошибки, удаляем созданную директорию
            try {
                Files.walk(backupDir.toPath())
                    .sorted((p1, p2) -> -p1.compareTo(p2))
                    .forEach(path -> {
                        try {
                            Files.delete(path);
                        } catch (IOException deleteError) {
                            logger.error("Ошибка при удалении файла: {}", path, deleteError);
                        }
                    });
            } catch (IOException deleteError) {
                logger.error("Ошибка при удалении директории с неудачной резервной копией: {}", backupPath, deleteError);
            }
            
            throw e;
        }
    }
    
    /**
     * Восстанавливает базы данных из указанной резервной копии
     * @param backupName имя резервной копии
     */
    public void restoreFromBackup(String backupName) throws IOException {
        String backupPath = backupDir + "/" + backupName;
        
        File backupDir = new File(backupPath);
        if (!backupDir.exists() || !backupDir.isDirectory()) {
            throw new IOException("Резервная копия не найдена: " + backupName);
        }
        
        File materialsBackup = new File(backupPath + "/materials_db.sql");
        File usersBackup = new File(backupPath + "/users_db.sql");
        
        if (!materialsBackup.exists() || !usersBackup.exists()) {
            throw new IOException("Резервная копия повреждена: отсутствуют необходимые файлы");
        }
        
        try {
            // Извлекаем имя базы данных из URL
            String materialsDbName = extractDatabaseName(materialsDbUrl);
            String usersDbName = extractDatabaseName(usersDbUrl);
            
            logger.info("Восстанавливаем базу данных материалов: {}", materialsDbName);
            restoreDatabase(materialsDbName, materialsDbUsername, materialsDbPassword, materialsBackup.getAbsolutePath());
            
            logger.info("Восстанавливаем базу данных пользователей: {}", usersDbName);
            restoreDatabase(usersDbName, usersDbUsername, usersDbPassword, usersBackup.getAbsolutePath());
            
            logger.info("Базы данных успешно восстановлены из резервной копии: {}", backupName);
        } catch (Exception e) {
            logger.error("Ошибка при восстановлении баз данных: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    /**
     * Возвращает список всех доступных резервных копий
     */
    public List<String> getAvailableBackups() {
        File dir = new File(backupDir);
        if (!dir.exists() || !dir.isDirectory()) {
            logger.info("Директория для резервных копий не существует: {}", backupDir);
            return new ArrayList<>();
        }
        
        File[] files = dir.listFiles(File::isDirectory);
        if (files == null) {
            logger.warn("Не удалось получить список файлов в директории: {}", backupDir);
            return new ArrayList<>();
        }
        
        List<String> backups = new ArrayList<>();
        for (File file : files) {
            // Проверяем, что это действительно резервная копия с необходимыми файлами
            if (new File(file, "materials_db.sql").exists() && new File(file, "users_db.sql").exists()) {
                backups.add(file.getName());
            }
        }
        
        logger.info("Найдены резервные копии: {}", backups);
        return backups;
    }
    
    /**
     * Удаляет указанную резервную копию
     */
    public void deleteBackup(String backupName) throws IOException {
        Path backupPath = Paths.get(backupDir, backupName);
        if (!Files.exists(backupPath) || !Files.isDirectory(backupPath)) {
            throw new IOException("Резервная копия не найдена: " + backupName);
        }
        
        try {
            Files.walk(backupPath)
                .sorted((p1, p2) -> -p1.compareTo(p2))
                .forEach(path -> {
                    try {
                        Files.delete(path);
                        logger.debug("Удален файл: {}", path);
                    } catch (IOException e) {
                        logger.error("Ошибка при удалении файла: {}", path, e);
                    }
                });
            
            logger.info("Удалена резервная копия: {}", backupName);
        } catch (Exception e) {
            logger.error("Ошибка при удалении резервной копии: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    /**
     * Извлекает имя базы данных из URL подключения
     */
    private String extractDatabaseName(String jdbcUrl) {
        // Пример URL: jdbc:postgresql://localhost:5432/materials_db
        String[] parts = jdbcUrl.split("/");
        return parts[parts.length - 1];
    }
    
    /**
     * Создает резервную копию указанной базы данных
     */
    private void backupDatabase(String dbName, String username, String password, String outputFile) throws IOException {
        ProcessBuilder processBuilder = new ProcessBuilder(
            "pg_dump", 
            "-h", "localhost",
            "-U", username,
            "-F", "p", // формат plain text SQL
            "-f", outputFile,
            dbName
        );
        
        logger.debug("Выполняем команду резервного копирования: pg_dump -h localhost -U {} -F p -f {} {}", 
                    username, outputFile, dbName);
        
        // Устанавливаем переменную окружения PGPASSWORD для аутентификации
        processBuilder.environment().put("PGPASSWORD", password);
        
        Process process = processBuilder.start();
        
        try {
            int exitCode = process.waitFor();
            String errorOutput = new BufferedReader(new InputStreamReader(process.getErrorStream()))
                .lines().collect(Collectors.joining("\n"));
                
            if (exitCode != 0) {
                logger.error("Ошибка при создании резервной копии (код {}):\n{}", exitCode, errorOutput);
                throw new IOException("Ошибка при создании резервной копии базы данных: " + errorOutput);
            }
            
            if (!errorOutput.isEmpty()) {
                logger.warn("Замечания при создании резервной копии:\n{}", errorOutput);
            }
            
            // Проверяем, что файл создан и не пустой
            File output = new File(outputFile);
            if (!output.exists() || output.length() == 0) {
                throw new IOException("Файл резервной копии не был создан или пуст: " + outputFile);
            }
            
            logger.info("Резервная копия базы данных {} успешно создана: {}", dbName, outputFile);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Процесс создания резервной копии был прерван", e);
        } catch (IOException e) {
            logger.error("Ошибка при создании резервной копии: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    /**
     * Восстанавливает базу данных из резервной копии
     */
    private void restoreDatabase(String dbName, String username, String password, String inputFile) throws IOException {
        try {
            // Сначала пересоздаем базу данных
            logger.info("Пересоздаем базу данных: {}", dbName);
            recreateDatabase(dbName, username, password);
            
            // Затем восстанавливаем данные
            logger.info("Восстанавливаем данные из файла: {}", inputFile);
            ProcessBuilder processBuilder = new ProcessBuilder(
                "psql", 
                "-h", "localhost",
                "-U", username,
                "-d", dbName,
                "-f", inputFile
            );
            
            logger.debug("Выполняем команду восстановления: psql -h localhost -U {} -d {} -f {}", 
                        username, dbName, inputFile);
            
            // Устанавливаем переменную окружения PGPASSWORD для аутентификации
            processBuilder.environment().put("PGPASSWORD", password);
            
            Process process = processBuilder.start();
            
            int exitCode = process.waitFor();
            String errorOutput = new BufferedReader(new InputStreamReader(process.getErrorStream()))
                .lines().collect(Collectors.joining("\n"));
                
            if (exitCode != 0) {
                logger.error("Ошибка при восстановлении базы данных (код {}):\n{}", exitCode, errorOutput);
                throw new IOException("Ошибка при восстановлении базы данных: " + errorOutput);
            }
            
            if (!errorOutput.isEmpty()) {
                logger.warn("Замечания при восстановлении базы данных:\n{}", errorOutput);
            }
            
            logger.info("База данных {} успешно восстановлена", dbName);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Процесс восстановления базы данных был прерван", e);
        } catch (IOException e) {
            logger.error("Ошибка при восстановлении базы данных: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    /**
     * Пересоздает базу данных
     */
    private void recreateDatabase(String dbName, String username, String password) throws IOException {
        try {
            // Сначала закрываем все активные соединения с базой данных
            logger.info("Закрываем активные соединения с базой данных: {}", dbName);
            ProcessBuilder disconnectBuilder = new ProcessBuilder(
                "psql", 
                "-h", "localhost",
                "-U", username,
                "-d", "postgres", // подключаемся к системной базе postgres
                "-c", "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '" + dbName + "' AND pid <> pg_backend_pid();"
            );
            
            disconnectBuilder.environment().put("PGPASSWORD", password);
            executeProcess(disconnectBuilder, "закрытие активных соединений");
            
            // Удаляем существующую базу данных
            logger.info("Удаляем существующую базу данных: {}", dbName);
            ProcessBuilder dropBuilder = new ProcessBuilder(
                "psql", 
                "-h", "localhost",
                "-U", username,
                "-d", "postgres", // подключаемся к системной базе postgres
                "-c", "DROP DATABASE IF EXISTS " + dbName + ";"
            );
            
            dropBuilder.environment().put("PGPASSWORD", password);
            executeProcess(dropBuilder, "удаление базы данных");
            
            // Создаем новую базу данных
            logger.info("Создаем новую базу данных: {}", dbName);
            ProcessBuilder createBuilder = new ProcessBuilder(
                "psql", 
                "-h", "localhost",
                "-U", username,
                "-d", "postgres", // подключаемся к системной базе postgres
                "-c", "CREATE DATABASE " + dbName + ";"
            );
            
            createBuilder.environment().put("PGPASSWORD", password);
            executeProcess(createBuilder, "создание базы данных");
            
            logger.info("База данных {} успешно пересоздана", dbName);
        } catch (IOException e) {
            logger.error("Ошибка при пересоздании базы данных: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    /**
     * Выполняет процесс и обрабатывает возможные ошибки
     */
    private void executeProcess(ProcessBuilder processBuilder, String operationName) throws IOException {
        try {
            Process process = processBuilder.start();
            
            int exitCode = process.waitFor();
            String errorOutput = new BufferedReader(new InputStreamReader(process.getErrorStream()))
                .lines().collect(Collectors.joining("\n"));
                
            if (exitCode != 0) {
                logger.error("Ошибка при выполнении операции '{}' (код {}):\n{}", operationName, exitCode, errorOutput);
                throw new IOException("Ошибка при выполнении команды: " + errorOutput);
            }
            
            if (!errorOutput.isEmpty()) {
                logger.warn("Замечания при выполнении операции '{}':\n{}", operationName, errorOutput);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Процесс был прерван при выполнении операции: " + operationName, e);
        } catch (IOException e) {
            logger.error("Ошибка при выполнении операции '{}': {}", operationName, e.getMessage(), e);
            throw e;
        }
    }
} 
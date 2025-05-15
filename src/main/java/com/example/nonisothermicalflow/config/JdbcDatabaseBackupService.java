package com.example.nonisothermicalflow.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.*;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.io.BufferedReader;
import java.lang.StringBuilder;

@Service
public class JdbcDatabaseBackupService {

    private static final Logger logger = LoggerFactory.getLogger(JdbcDatabaseBackupService.class);

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
    
    public JdbcDatabaseBackupService() {
        // Создаем директорию для бэкапов, если она не существует
        File dir = new File(backupDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }
    }
    
    /**
     * Создает резервную копию обеих баз данных
     * @return имя созданной резервной копии
     */
    public String createBackup() throws IOException {
        String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        String backupName = "backup_" + timestamp;
        String backupPath = backupDir + "/" + backupName;
        
        File backupDirFile = new File(backupPath);
        if (!backupDirFile.mkdirs()) {
            throw new IOException("Не удалось создать директорию для резервной копии: " + backupPath);
        }
        
        logger.info("Создаем резервную копию в директории: {}", backupPath);
        
        try {
            // Создаем бэкап каждой базы данных
            backupMaterialsDatabase(backupPath + "/materials_db.sql");
            backupUsersDatabase(backupPath + "/users_db.sql");
            
            // Создаем метаданные бэкапа
            createBackupMetadata(backupPath + "/metadata.json", backupName, timestamp);
            
            logger.info("Резервная копия успешно создана: {}", backupName);
            return backupName;
        } catch (Exception e) {
            logger.error("Ошибка при создании резервной копии: {}", e.getMessage(), e);
            
            // В случае ошибки, удаляем созданную директорию
            try {
                Files.walk(backupDirFile.toPath())
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
            
            throw new IOException("Ошибка при создании резервной копии: " + e.getMessage(), e);
        }
    }
    
    /**
     * Создает метаданные бэкапа
     */
    private void createBackupMetadata(String metadataFile, String backupName, String timestamp) throws IOException {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(metadataFile))) {
            writer.write("{\n");
            writer.write("  \"backupName\": \"" + backupName + "\",\n");
            writer.write("  \"timestamp\": \"" + timestamp + "\",\n");
            writer.write("  \"createdAt\": \"" + new Date() + "\",\n");
            writer.write("  \"materialsDbUrl\": \"" + materialsDbUrl + "\",\n");
            writer.write("  \"usersDbUrl\": \"" + usersDbUrl + "\"\n");
            writer.write("}\n");
        }
    }
    
    /**
     * Создает резервную копию базы данных материалов
     */
    private void backupMaterialsDatabase(String outputFile) throws IOException {
        try {
            logger.info("Создаем резервную копию базы данных materials_db");
            createDataBackup(materialsDbUrl, materialsDbUsername, materialsDbPassword, outputFile);
        } catch (Exception e) {
            throw new IOException("Ошибка при создании резервной копии базы данных materials_db: " + e.getMessage(), e);
        }
    }
    
    /**
     * Создает резервную копию базы данных пользователей
     */
    private void backupUsersDatabase(String outputFile) throws IOException {
        try {
            logger.info("Создаем резервную копию базы данных users_db");
            createDataBackup(usersDbUrl, usersDbUsername, usersDbPassword, outputFile);
        } catch (Exception e) {
            throw new IOException("Ошибка при создании резервной копии базы данных users_db: " + e.getMessage(), e);
        }
    }
    
    /**
     * Создает резервную копию базы данных с помощью JDBC
     */
    private void createDataBackup(String dbUrl, String username, String password, String outputFile) throws SQLException, IOException {
        logger.info("Подключение к базе данных: {}", dbUrl);
        
        try (Connection conn = DriverManager.getConnection(dbUrl, username, password);
             BufferedWriter writer = new BufferedWriter(new FileWriter(outputFile))) {
             
            // Получаем метаданные о таблицах
            DatabaseMetaData metaData = conn.getMetaData();
            ResultSet tables = metaData.getTables(null, "public", null, new String[]{"TABLE"});
            
            // Начинаем транзакцию
            writer.write("BEGIN;\n\n");
            
            // Получаем список всех таблиц
            List<String> tableNames = new ArrayList<>();
            while (tables.next()) {
                String tableName = tables.getString("TABLE_NAME");
                tableNames.add(tableName);
            }
            
            // Создаем SQL для каждой таблицы
            for (String tableName : tableNames) {
                logger.info("Создаем SQL для таблицы: {}", tableName);
                
                // Получаем структуру таблицы
                writer.write("-- Структура таблицы " + tableName + "\n");
                writer.write("CREATE TABLE IF NOT EXISTS " + tableName + " (\n");
                
                ResultSet columns = metaData.getColumns(null, null, tableName, null);
                boolean first = true;
                List<String> columnNames = new ArrayList<>();
                
                while (columns.next()) {
                    String columnName = columns.getString("COLUMN_NAME");
                    String dataType = columns.getString("TYPE_NAME");
                    String columnSize = columns.getString("COLUMN_SIZE");
                    String decimalDigits = columns.getString("DECIMAL_DIGITS");
                    String isNullable = columns.getString("IS_NULLABLE");
                    String defaultValue = columns.getString("COLUMN_DEF");
                    
                    columnNames.add(columnName);
                    
                    if (!first) {
                        writer.write(",\n");
                    }
                    first = false;
                    
                    writer.write("  " + columnName + " " + dataType);
                    
                    if (dataType.equalsIgnoreCase("varchar") || dataType.contains("char")) {
                        writer.write("(" + columnSize + ")");
                    } else if (dataType.equalsIgnoreCase("numeric") && decimalDigits != null) {
                        writer.write("(" + columnSize + "," + decimalDigits + ")");
                    }
                    
                    if (isNullable.equals("NO")) {
                        writer.write(" NOT NULL");
                    }
                    
                    if (defaultValue != null) {
                        writer.write(" DEFAULT " + defaultValue);
                    }
                }
                
                // Получаем первичный ключ
                ResultSet primaryKeys = metaData.getPrimaryKeys(null, null, tableName);
                List<String> pkColumns = new ArrayList<>();
                
                while (primaryKeys.next()) {
                    pkColumns.add(primaryKeys.getString("COLUMN_NAME"));
                }
                
                if (!pkColumns.isEmpty()) {
                    writer.write(",\n  PRIMARY KEY (" + String.join(", ", pkColumns) + ")");
                }
                
                writer.write("\n);\n\n");
                
                // Получаем данные таблицы
                writer.write("-- Данные таблицы " + tableName + "\n");
                
                try (Statement stmt = conn.createStatement();
                     ResultSet rs = stmt.executeQuery("SELECT * FROM " + tableName)) {
                    
                    ResultSetMetaData rsmd = rs.getMetaData();
                    int columnCount = rsmd.getColumnCount();
                    
                    while (rs.next()) {
                        writer.write("INSERT INTO " + tableName + " (");
                        
                        // Записываем имена столбцов
                        for (int i = 1; i <= columnCount; i++) {
                            if (i > 1) {
                                writer.write(", ");
                            }
                            writer.write(rsmd.getColumnName(i));
                        }
                        
                        writer.write(") VALUES (");
                        
                        // Записываем значения
                        for (int i = 1; i <= columnCount; i++) {
                            if (i > 1) {
                                writer.write(", ");
                            }
                            
                            Object value = rs.getObject(i);
                            if (value == null) {
                                writer.write("NULL");
                            } else {
                                String sqlType = rsmd.getColumnTypeName(i);
                                if (sqlType.equals("varchar") || sqlType.equals("text") || 
                                    sqlType.equals("date") || sqlType.equals("timestamp") ||
                                    sqlType.contains("char")) {
                                    String stringValue = rs.getString(i);
                                    // Экранируем одинарные кавычки
                                    stringValue = stringValue.replace("'", "''");
                                    writer.write("'" + stringValue + "'");
                                } else if (sqlType.equals("bool") || sqlType.equals("boolean")) {
                                    writer.write(rs.getBoolean(i) ? "true" : "false");
                                } else {
                                    writer.write(value.toString());
                                }
                            }
                        }
                        
                        writer.write(");\n");
                    }
                }
                
                writer.write("\n");
            }
            
            // Записываем внешние ключи
            for (String tableName : tableNames) {
                ResultSet foreignKeys = metaData.getImportedKeys(null, null, tableName);
                while (foreignKeys.next()) {
                    String fkName = foreignKeys.getString("FK_NAME");
                    String fkColumnName = foreignKeys.getString("FKCOLUMN_NAME");
                    String pkTableName = foreignKeys.getString("PKTABLE_NAME");
                    String pkColumnName = foreignKeys.getString("PKCOLUMN_NAME");
                    
                    writer.write("ALTER TABLE " + tableName + " ADD CONSTRAINT " + fkName + 
                                " FOREIGN KEY (" + fkColumnName + ") REFERENCES " + 
                                pkTableName + "(" + pkColumnName + ");\n");
                }
            }
            
            // Завершаем транзакцию
            writer.write("\nCOMMIT;\n");
            
            logger.info("Резервная копия базы данных успешно создана: {}", outputFile);
        }
    }
    
    /**
     * Восстанавливает базы данных из указанной резервной копии
     * @param backupName имя резервной копии
     */
    public void restoreFromBackup(String backupName) throws IOException {
        String backupPath = backupDir + "/" + backupName;
        
        File backupDirFile = new File(backupPath);
        if (!backupDirFile.exists() || !backupDirFile.isDirectory()) {
            throw new IOException("Резервная копия не найдена: " + backupName);
        }
        
        File materialsBackup = new File(backupPath + "/materials_db.sql");
        File usersBackup = new File(backupPath + "/users_db.sql");
        
        if (!materialsBackup.exists() || !usersBackup.exists()) {
            throw new IOException("Резервная копия повреждена: отсутствуют необходимые файлы");
        }
        
        try {
            logger.info("Восстанавливаем базу данных материалов");
            restoreDatabase(materialsDbUrl, materialsDbUsername, materialsDbPassword, materialsBackup.getAbsolutePath());
            
            logger.info("Восстанавливаем базу данных пользователей");
            restoreDatabase(usersDbUrl, usersDbUsername, usersDbPassword, usersBackup.getAbsolutePath());
            
            logger.info("Базы данных успешно восстановлены из резервной копии: {}", backupName);
        } catch (Exception e) {
            throw new IOException("Ошибка при восстановлении баз данных: " + e.getMessage(), e);
        }
    }
    
    /**
     * Восстанавливает базу данных из SQL файла
     */
    private void restoreDatabase(String dbUrl, String username, String password, String inputFile) throws SQLException, IOException {
        logger.info("Подключение к базе данных: {}", dbUrl);
        
        // Чтение SQL файла
        String sql = new String(Files.readAllBytes(Paths.get(inputFile)));
        
        try (Connection conn = DriverManager.getConnection(dbUrl, username, password)) {
            // Отключаем автоматическую фиксацию изменений
            conn.setAutoCommit(false);
            
            try (Statement stmt = conn.createStatement()) {
                // Отключаем внешние ключи для PostgreSQL
                stmt.execute("SET session_replication_role = 'replica';");
                
                logger.info("Очищаем все таблицы перед восстановлением");
                // Очищаем все таблицы
                clearAllTables(conn);
                
                logger.info("Начинаем выполнение SQL-скрипта восстановления");
                
                // Для более корректной обработки SQL-скрипта, будем обрабатывать его построчно
                BufferedReader reader = new BufferedReader(new java.io.StringReader(sql));
                StringBuilder currentStatement = new StringBuilder();
                String line;
                
                while ((line = reader.readLine()) != null) {
                    // Пропускаем пустые строки и комментарии
                    line = line.trim();
                    if (line.isEmpty() || line.startsWith("--")) {
                        continue;
                    }
                    
                    // Добавляем текущую строку к текущему выражению
                    currentStatement.append(line).append("\n");
                    
                    // Если строка заканчивается точкой с запятой, выполняем собранное выражение
                    if (line.endsWith(";")) {
                        String statementToExecute = currentStatement.toString().trim();
                        // Пропускаем команды BEGIN и COMMIT, мы управляем транзакцией сами
                        if (!statementToExecute.equalsIgnoreCase("BEGIN;") && 
                            !statementToExecute.equalsIgnoreCase("COMMIT;")) {
                            try {
                                stmt.execute(statementToExecute);
                                logger.debug("Успешно выполнена команда: {}", statementToExecute);
                            } catch (SQLException e) {
                                logger.warn("Ошибка при выполнении SQL: {} - {}", statementToExecute, e.getMessage());
                                // Продолжаем выполнение, обрабатывая неблокирующие ошибки
                                // Например, если таблица уже существует при CREATE TABLE
                                if (e.getMessage().contains("already exists") || 
                                    e.getMessage().contains("duplicate key")) {
                                    logger.warn("Некритическая ошибка, продолжаем восстановление");
                                } else {
                                    // Если это потенциально критическая ошибка, логируем подробности
                                    logger.error("Критическая ошибка SQL: {}", e.getMessage(), e);
                                }
                            }
                        }
                        // Сбрасываем буфер для следующего выражения
                        currentStatement.setLength(0);
                    }
                }
                
                // Включаем обратно проверку внешних ключей
                stmt.execute("SET session_replication_role = 'origin';");
                
                // Фиксируем изменения
                conn.commit();
                logger.info("Восстановление базы данных успешно завершено");
                
            } catch (SQLException e) {
                // В случае ошибки откатываем изменения
                logger.error("Ошибка при восстановлении, выполняем откат: {}", e.getMessage(), e);
                conn.rollback();
                throw e;
            }
        }
    }
    
    /**
     * Очищает все таблицы в базе данных
     */
    private void clearAllTables(Connection conn) throws SQLException {
        try (Statement stmt = conn.createStatement()) {
            // Получаем список всех таблиц из схемы public
            ResultSet rs = stmt.executeQuery(
                "SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
            
            List<String> tableNames = new ArrayList<>();
            while (rs.next()) {
                tableNames.add(rs.getString("tablename"));
            }
            
            // Если нет таблиц, нечего очищать
            if (tableNames.isEmpty()) {
                logger.info("Нет таблиц для очистки");
                return;
            }
            
            logger.info("Начинаем очистку таблиц: {}", tableNames);
            
            // Отключаем все ограничения на время операции (для PostgreSQL)
            stmt.execute("SET session_replication_role = 'replica';");
            
            // Очищаем каждую таблицу
            for (String tableName : tableNames) {
                try {
                    logger.debug("Очищаем таблицу: {}", tableName);
                    stmt.execute("TRUNCATE TABLE " + tableName + " CASCADE;");
                } catch (SQLException e) {
                    logger.warn("Ошибка при очистке таблицы {}: {}", tableName, e.getMessage());
                }
            }
            
            // Включаем обратно все ограничения
            stmt.execute("SET session_replication_role = 'origin';");
            
            logger.info("Очистка таблиц завершена");
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
} 
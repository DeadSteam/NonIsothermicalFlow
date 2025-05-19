package com.example.nonisothermicalflow.admin.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Конфигурация для хранения учетных данных баз данных
 */
@Component
@Getter
public class DatabaseCredentialsConfig {

    /**
     * URL базы данных материалов
     */
    @Value("${spring.datasource.materials.url}")
    private String materialsDbUrl;

    /**
     * Имя пользователя для базы данных материалов
     */
    @Value("${spring.datasource.materials.username}")
    private String materialsDbUsername;

    /**
     * Пароль для базы данных материалов
     */
    @Value("${spring.datasource.materials.password}")
    private String materialsDbPassword;

    /**
     * URL базы данных пользователей
     */
    @Value("${spring.datasource.users.url}")
    private String usersDbUrl;

    /**
     * Имя пользователя для базы данных пользователей
     */
    @Value("${spring.datasource.users.username}")
    private String usersDbUsername;

    /**
     * Пароль для базы данных пользователей
     */
    @Value("${spring.datasource.users.password}")
    private String usersDbPassword;

    /**
     * Получение имени узла базы данных материалов
     */
    public String getMaterialsDbHost() {
        return extractHostFromUrl(materialsDbUrl);
    }

    /**
     * Получение порта базы данных материалов
     */
    public String getMaterialsDbPort() {
        return extractPortFromUrl(materialsDbUrl);
    }

    /**
     * Получение имени базы данных материалов
     */
    public String getMaterialsDbName() {
        return extractDbNameFromUrl(materialsDbUrl);
    }

    /**
     * Получение имени узла базы данных пользователей
     */
    public String getUsersDbHost() {
        return extractHostFromUrl(usersDbUrl);
    }

    /**
     * Получение порта базы данных пользователей
     */
    public String getUsersDbPort() {
        return extractPortFromUrl(usersDbUrl);
    }

    /**
     * Получение имени базы данных пользователей
     */
    public String getUsersDbName() {
        return extractDbNameFromUrl(usersDbUrl);
    }

    /**
     * Извлечение имени узла из URL базы данных
     */
    private String extractHostFromUrl(String url) {
        // Парсим строку подключения к postgresql: jdbc:postgresql://localhost:5432/db_name
        if (url == null || !url.startsWith("jdbc:postgresql://")) {
            return "localhost";
        }
        
        String hostPort = url.substring("jdbc:postgresql://".length());
        int colonIndex = hostPort.indexOf(':');
        if (colonIndex == -1) {
            int slashIndex = hostPort.indexOf('/');
            return slashIndex == -1 ? hostPort : hostPort.substring(0, slashIndex);
        }
        return hostPort.substring(0, colonIndex);
    }

    /**
     * Извлечение порта из URL базы данных
     */
    private String extractPortFromUrl(String url) {
        // Парсим строку подключения к postgresql: jdbc:postgresql://localhost:5432/db_name
        if (url == null || !url.startsWith("jdbc:postgresql://")) {
            return "5432";
        }

        String hostPort = url.substring("jdbc:postgresql://".length());
        int colonIndex = hostPort.indexOf(':');
        if (colonIndex == -1) {
            return "5432";
        }

        int slashIndex = hostPort.indexOf('/', colonIndex);
        if (slashIndex == -1) {
            return hostPort.substring(colonIndex + 1);
        }
        
        return hostPort.substring(colonIndex + 1, slashIndex);
    }

    /**
     * Извлечение имени базы данных из URL
     */
    private String extractDbNameFromUrl(String url) {
        // Парсим строку подключения к postgresql: jdbc:postgresql://localhost:5432/db_name
        if (url == null) {
            return "";
        }

        int lastSlashIndex = url.lastIndexOf('/');
        if (lastSlashIndex == -1 || lastSlashIndex == url.length() - 1) {
            return "";
        }

        String dbName = url.substring(lastSlashIndex + 1);
        int paramIndex = dbName.indexOf('?');
        return paramIndex == -1 ? dbName : dbName.substring(0, paramIndex);
    }
} 
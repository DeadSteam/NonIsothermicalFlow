package com.example.nonisothermicalflow.admin.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Модель резервной копии базы данных
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DatabaseBackup {
    /**
     * Уникальный идентификатор резервной копии
     */
    private UUID id;
    
    /**
     * Имя файла резервной копии
     */
    private String filename;
    
    /**
     * Размер файла в байтах
     */
    private long size;
    
    /**
     * Дата и время создания
     */
    private LocalDateTime createdAt;
    
    /**
     * Имя базы данных
     */
    private String database;
} 
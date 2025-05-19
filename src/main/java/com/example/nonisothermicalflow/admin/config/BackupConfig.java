package com.example.nonisothermicalflow.admin.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.io.File;

/**
 * Конфигурация системы резервного копирования
 */
@Configuration
@Slf4j
@RequiredArgsConstructor
public class BackupConfig {

    @Value("${backup.directory:./db_backups}")
    private String backupDirectory;

    /**
     * Инициализация директории для хранения резервных копий при запуске
     */
    @PostConstruct
    public void init() {
        File backupDir = new File(backupDirectory);
        if (!backupDir.exists()) {
            log.info("Создание директории для резервных копий: {}", backupDirectory);
            if (backupDir.mkdirs()) {
                log.info("Директория для резервных копий успешно создана");
            } else {
                log.error("Ошибка при создании директории для резервных копий: {}", backupDirectory);
            }
        } else {
            log.info("Директория для резервных копий уже существует: {}", backupDirectory);
        }
    }
} 
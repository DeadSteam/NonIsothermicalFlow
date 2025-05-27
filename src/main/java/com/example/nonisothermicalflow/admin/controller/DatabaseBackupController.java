package com.example.nonisothermicalflow.admin.controller;

import com.example.nonisothermicalflow.admin.model.DatabaseBackup;
import com.example.nonisothermicalflow.admin.service.DockerDatabaseBackupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

/**
 * Контроллер для API управления резервными копиями баз данных
 */
@RestController
@RequestMapping("/api/v1/admin/backups")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Slf4j
public class DatabaseBackupController {

    private final DockerDatabaseBackupService backupService;

    /**
     * Получение списка всех резервных копий
     *
     * @return список резервных копий
     */
    @GetMapping
    public ResponseEntity<List<DatabaseBackup>> getAllBackups() {
        try {
            log.info("Запрос на получение списка всех резервных копий");
            List<DatabaseBackup> backups = backupService.getAllBackups();
            return ResponseEntity.ok(backups);
        } catch (Exception e) {
            log.error("Ошибка при получении списка резервных копий", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Ошибка при получении списка резервных копий: " + e.getMessage());
        }
    }

    /**
     * Создание новой резервной копии базы данных
     *
     * @return созданные резервные копии
     */
    @PostMapping
    public ResponseEntity<List<DatabaseBackup>> createBackup() {
        try {
            log.info("Запрос на создание резервной копии БД");
            List<DatabaseBackup> createdBackups = backupService.createBackup();
            return ResponseEntity.status(HttpStatus.CREATED).body(createdBackups);
        } catch (IOException e) {
            log.error("Ошибка при создании резервной копии", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Ошибка при создании резервной копии: " + e.getMessage());
        }
    }

    /**
     * Получение информации о резервной копии по идентификатору
     *
     * @param id идентификатор резервной копии
     * @return информация о резервной копии
     */
    @GetMapping("/{id}")
    public ResponseEntity<DatabaseBackup> getBackupById(@PathVariable UUID id) {
        try {
            log.info("Запрос на получение резервной копии с id: {}", id);
            DatabaseBackup backup = backupService.getBackupById(id);
            return ResponseEntity.ok(backup);
        } catch (IllegalArgumentException e) {
            log.warn("Ошибка запроса резервной копии: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, 
                    "Резервная копия не найдена: " + e.getMessage());
        }
    }

    /**
     * Скачивание файла резервной копии
     *
     * @param id идентификатор резервной копии
     * @return файл резервной копии
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadBackup(@PathVariable UUID id) {
        try {
            log.info("Запрос на скачивание резервной копии с id: {}", id);
            DatabaseBackup backup = backupService.getBackupById(id);
            Resource resource = backupService.getBackupFile(id);

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + backup.getFilename() + "\"")
                    .body(resource);
        } catch (IllegalArgumentException e) {
            log.warn("Ошибка запроса скачивания: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, 
                    "Резервная копия не найдена: " + e.getMessage());
        } catch (IOException e) {
            log.error("Ошибка при скачивании файла", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Ошибка при скачивании файла: " + e.getMessage());
        }
    }

    /**
     * Восстановление базы данных из резервной копии
     *
     * @param id идентификатор резервной копии
     * @return сообщение об успешном восстановлении
     */
    @PostMapping("/{id}/restore")
    public ResponseEntity<String> restoreBackup(@PathVariable UUID id) {
        try {
            log.info("Запрос на восстановление базы данных из резервной копии с id: {}", id);
            DatabaseBackup backup = backupService.getBackupById(id);
            backupService.restoreBackup(id);
            return ResponseEntity.ok("База данных " + backup.getDatabase() + 
                    " успешно восстановлена из резервной копии: " + backup.getFilename());
        } catch (IllegalArgumentException e) {
            log.warn("Ошибка запроса восстановления: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, 
                    "Резервная копия не найдена: " + e.getMessage());
        } catch (IOException e) {
            log.error("Ошибка при восстановлении базы данных", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Ошибка при восстановлении базы данных: " + e.getMessage());
        }
    }

    /**
     * Удаление резервной копии
     *
     * @param id идентификатор резервной копии
     * @return пустой ответ с кодом 204
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBackup(@PathVariable UUID id) {
        try {
            log.info("Запрос на удаление резервной копии с id: {}", id);
            backupService.deleteBackup(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.warn("Ошибка запроса удаления: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, 
                    "Резервная копия не найдена: " + e.getMessage());
        } catch (IOException e) {
            log.error("Ошибка при удалении резервной копии", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Ошибка при удалении резервной копии: " + e.getMessage());
        }
    }
} 
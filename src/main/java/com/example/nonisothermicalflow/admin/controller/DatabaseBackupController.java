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

import java.io.IOException;
import java.util.List;
import java.util.UUID;

/**
 * REST контроллер для API управления резервными копиями баз данных
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
        log.info("Запрос на получение списка всех резервных копий");
        List<DatabaseBackup> backups = backupService.getAllBackups();
        return ResponseEntity.ok(backups);
    }

    /**
     * Создание новой резервной копии базы данных
     *
     * @return созданные резервные копии
     */
    @PostMapping
    public ResponseEntity<?> createBackup() {
        try {
            log.info("Запрос на создание резервной копии БД");
            List<DatabaseBackup> createdBackups = backupService.createBackup();
            return ResponseEntity.ok(createdBackups);
        } catch (IOException e) {
            log.error("Ошибка при создании резервной копии", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Ошибка при создании резервной копии: " + e.getMessage());
        }
    }

    /**
     * Получение информации о резервной копии по идентификатору
     *
     * @param id идентификатор резервной копии
     * @return информация о резервной копии
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getBackupById(@PathVariable UUID id) {
        try {
            log.info("Запрос на получение резервной копии с id: {}", id);
            DatabaseBackup backup = backupService.getBackupById(id);
            return ResponseEntity.ok(backup);
        } catch (IllegalArgumentException e) {
            log.warn("Ошибка запроса резервной копии: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Резервная копия не найдена: " + e.getMessage());
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
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            log.error("Ошибка при скачивании файла", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Восстановление базы данных из резервной копии
     *
     * @param id идентификатор резервной копии
     * @return результат операции
     */
    @PostMapping("/{id}/restore")
    public ResponseEntity<?> restoreBackup(@PathVariable UUID id) {
        try {
            log.info("Запрос на восстановление базы данных из резервной копии с id: {}", id);
            DatabaseBackup backup = backupService.getBackupById(id);
            backupService.restoreBackup(id);
            return ResponseEntity.ok().body("База данных " + backup.getDatabase() + 
                    " успешно восстановлена из резервной копии: " + backup.getFilename());
        } catch (IllegalArgumentException e) {
            log.warn("Ошибка запроса восстановления: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Резервная копия не найдена: " + e.getMessage());
        } catch (IOException e) {
            log.error("Ошибка при восстановлении базы данных", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Ошибка при восстановлении базы данных: " + e.getMessage());
        }
    }

    /**
     * Удаление резервной копии
     *
     * @param id идентификатор резервной копии
     * @return результат операции
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBackup(@PathVariable UUID id) {
        try {
            log.info("Запрос на удаление резервной копии с id: {}", id);
            DatabaseBackup backup = backupService.getBackupById(id);
            backupService.deleteBackup(id);
            return ResponseEntity.ok().body("Резервная копия " + backup.getFilename() + " успешно удалена");
        } catch (IllegalArgumentException e) {
            log.warn("Ошибка запроса удаления: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Резервная копия не найдена: " + e.getMessage());
        } catch (IOException e) {
            log.error("Ошибка при удалении резервной копии", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Ошибка при удалении резервной копии: " + e.getMessage());
        }
    }
} 
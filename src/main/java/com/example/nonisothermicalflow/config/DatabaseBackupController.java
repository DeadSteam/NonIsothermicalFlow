package com.example.nonisothermicalflow.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/admin/database")
@PreAuthorize("hasRole('ADMIN')")
public class DatabaseBackupController {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseBackupController.class);

    private final JdbcDatabaseBackupService backupService;

    @Autowired
    public DatabaseBackupController(JdbcDatabaseBackupService backupService) {
        this.backupService = backupService;
    }

    @PostMapping("/backup")
    public ResponseEntity<?> createBackup() {
        try {
            String backupName = backupService.createBackup();
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Резервная копия успешно создана");
            response.put("backupName", backupName);
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Не удалось создать резервную копию: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/restore/{backupName}")
    public ResponseEntity<?> restoreBackup(@PathVariable String backupName) {
        try {
            logger.info("Получен запрос на восстановление из резервной копии: {}", backupName);
            
            // Проверяем существование резервной копии
            if (!backupService.backupExists(backupName)) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Резервная копия не найдена: " + backupName);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
            
            // Выполняем восстановление в отдельном потоке для снижения нагрузки
            backupService.restoreFromBackup(backupName);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "База данных успешно восстановлена из резервной копии: " + backupName);
            
            logger.info("Восстановление из резервной копии {} успешно выполнено", backupName);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            logger.error("Ошибка при восстановлении из резервной копии {}: {}", backupName, e.getMessage(), e);
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Не удалось восстановить базу данных: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/backups")
    public ResponseEntity<List<String>> getAvailableBackups() {
        List<String> backups = backupService.getAvailableBackups();
        return ResponseEntity.ok(backups);
    }

    @DeleteMapping("/backup/{backupName}")
    public ResponseEntity<?> deleteBackup(@PathVariable String backupName) {
        try {
            backupService.deleteBackup(backupName);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Резервная копия успешно удалена: " + backupName);
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Не удалось удалить резервную копию: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
} 
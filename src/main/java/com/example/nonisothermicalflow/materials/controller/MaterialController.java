package com.example.nonisothermicalflow.materials.controller;

import com.example.nonisothermicalflow.materials.model.Material;
import com.example.nonisothermicalflow.materials.service.MaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

/**
 * Контроллер для API работы с материалами
 */
@RestController
@RequestMapping("/api/v1/materials")
@RequiredArgsConstructor
public class MaterialController {
    
    private final MaterialService materialService;

    /**
     * Получение материала по ID
     *
     * @param id идентификатор материала
     * @return материал
     */
    @GetMapping("/{id}")
    public ResponseEntity<Material> getMaterialById(@PathVariable UUID id) {
        try {
            Material material = materialService.getMaterialById(id);
            return ResponseEntity.ok(material);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Ошибка при получении материала: " + e.getMessage());
        }
    }

    /**
     * Получение всех материалов
     *
     * @return список всех материалов
     */
    @GetMapping
    public ResponseEntity<List<Material>> getAllMaterials() {
        try {
            List<Material> materials = materialService.getAllMaterials();
            return ResponseEntity.ok(materials);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Ошибка при получении списка материалов: " + e.getMessage());
        }
    }

    /**
     * Создание нового материала
     *
     * @param material данные материала для создания
     * @return созданный материал
     */
    @PostMapping
    public ResponseEntity<Material> createMaterial(@RequestBody Material material) {
        try {
            Material createdMaterial = materialService.createMaterial(material);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdMaterial);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Ошибка при создании материала: " + e.getMessage());
        }
    }

    /**
     * Обновление материала
     *
     * @param id идентификатор материала
     * @param material обновленные данные материала
     * @return обновленный материал
     */
    @PutMapping("/{id}")
    public ResponseEntity<Material> updateMaterial(@PathVariable UUID id, @RequestBody Material material) {
        try {
            Material updatedMaterial = materialService.updateMaterial(id, material);
            return ResponseEntity.ok(updatedMaterial);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (IllegalStateException e) {
            if (e.getMessage().contains("не найден")) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
            }
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Ошибка при обновлении материала: " + e.getMessage());
        }
    }

    /**
     * Удаление материала
     *
     * @param id идентификатор материала
     * @return пустой ответ с кодом 204
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaterial(@PathVariable UUID id) {
        try {
            materialService.deleteMaterial(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Ошибка при удалении материала: " + e.getMessage());
        }
    }
}

 
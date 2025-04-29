package com.example.nonisothermicalflow.materials.controller;

import com.example.nonisothermicalflow.materials.model.MaterialProperty;
import com.example.nonisothermicalflow.materials.service.MaterialPropertyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

/**
 * Контроллер для API работы со свойствами материалов
 */
@RestController
@RequestMapping("/api/material-properties")
@RequiredArgsConstructor
public class MaterialPropertyController {

    private final MaterialPropertyService propertyService;

    /**
     * Получение свойства материала по ID
     *
     * @param id идентификатор свойства
     * @return свойство материала
     */
    @GetMapping("/{id}")
    public ResponseEntity<MaterialProperty> getMaterialPropertyById(@PathVariable UUID id) {
        try {
            MaterialProperty property = propertyService.getMaterialPropertyById(id);
            return ResponseEntity.ok(property);
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Ошибка при получении свойства материала: " + e.getMessage());
        }
    }

    /**
     * Получение всех свойств материалов
     *
     * @return список всех свойств материалов
     */
    @GetMapping
    public ResponseEntity<List<MaterialProperty>> getAllMaterialProperties() {
        try {
            List<MaterialProperty> properties = propertyService.getAllMaterialProperties();
            return ResponseEntity.ok(properties);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Ошибка при получении списка свойств материалов: " + e.getMessage());
        }
    }

    /**
     * Создание нового свойства материала
     *
     * @param property свойство материала для создания
     * @return созданное свойство материала
     */
    @PostMapping
    public ResponseEntity<MaterialProperty> createMaterialProperty(@RequestBody MaterialProperty property) {
        try {
            MaterialProperty createdProperty = propertyService.createMaterialProperty(property);
            return new ResponseEntity<>(createdProperty, HttpStatus.CREATED);
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Ошибка при создании свойства материала: " + e.getMessage());
        }
    }

    /**
     * Обновление свойства материала
     *
     * @param id идентификатор свойства
     * @param property обновленное свойство материала
     * @return обновленное свойство материала
     */
    @PutMapping("/{id}")
    public ResponseEntity<MaterialProperty> updateMaterialProperty(
            @PathVariable UUID id, 
            @RequestBody MaterialProperty property) {
        try {
            MaterialProperty updatedProperty = propertyService.updateMaterialProperty(id, property);
            return ResponseEntity.ok(updatedProperty);
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Ошибка при обновлении свойства материала: " + e.getMessage());
        }
    }

    /**
     * Удаление свойства материала
     *
     * @param id идентификатор свойства
     * @return ответ без содержимого
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaterialProperty(@PathVariable UUID id) {
        try {
            propertyService.deleteMaterialProperty(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Ошибка при удалении свойства материала: " + e.getMessage());
        }
    }
} 
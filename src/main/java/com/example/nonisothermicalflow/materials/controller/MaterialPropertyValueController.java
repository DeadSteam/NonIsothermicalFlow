package com.example.nonisothermicalflow.materials.controller;

import com.example.nonisothermicalflow.materials.model.MaterialPropertyValue;
import com.example.nonisothermicalflow.materials.service.MaterialPropertyValueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/material-properties")
@RequiredArgsConstructor
public class MaterialPropertyValueController {

    private final MaterialPropertyValueService propertyValueService;

    @GetMapping("/material/{materialId}")
    public ResponseEntity<List<MaterialPropertyValue>> getMaterialProperties(@PathVariable UUID materialId) {
        try {
            List<MaterialPropertyValue> propertyValues = propertyValueService.getMaterialProperties(materialId);
            return ResponseEntity.ok(propertyValues);
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Ошибка при получении значений свойств материала: " + e.getMessage());
        }
    }

    @PostMapping("/material/{materialId}/property/{propertyId}")
    public ResponseEntity<MaterialPropertyValue> addPropertyValue(
            @PathVariable UUID materialId,
            @PathVariable UUID propertyId,
            @RequestBody Map<String, Double> requestBody) {
        try {
            Double value = requestBody.get("value");
            if (value == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Поле 'value' обязательно");
            }
            
            MaterialPropertyValue propertyValue = propertyValueService.addPropertyValue(
                    materialId, propertyId, value);
            
            return new ResponseEntity<>(propertyValue, HttpStatus.CREATED);
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Ошибка при добавлении значения свойства: " + e.getMessage());
        }
    }

    @PutMapping("/material/{materialId}/property/{propertyId}")
    public ResponseEntity<MaterialPropertyValue> updatePropertyValue(
            @PathVariable UUID materialId,
            @PathVariable UUID propertyId,
            @RequestBody Map<String, Double> requestBody) {
        try {
            Double newValue = requestBody.get("value");
            if (newValue == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Поле 'value' обязательно");
            }
            
            MaterialPropertyValue updatedValue = propertyValueService.updatePropertyValue(
                    materialId, propertyId, newValue);
            
            return ResponseEntity.ok(updatedValue);
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Ошибка при обновлении значения свойства: " + e.getMessage());
        }
    }

    @DeleteMapping("/material/{materialId}/property/{propertyId}")
    public ResponseEntity<Void> deletePropertyValue(
            @PathVariable UUID materialId,
            @PathVariable UUID propertyId) {
        try {
            propertyValueService.deletePropertyValue(materialId, propertyId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Ошибка при удалении значения свойства: " + e.getMessage());
        }
    }

    @DeleteMapping("/material/{materialId}")
    public ResponseEntity<Void> deleteAllMaterialPropertyValues(@PathVariable UUID materialId) {
        try {
            propertyValueService.deleteAllMaterialPropertyValues(materialId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Ошибка при удалении всех значений свойств материала: " + e.getMessage());
        }
    }

    @DeleteMapping("/property/{propertyId}")
    public ResponseEntity<Void> deleteAllPropertyValues(@PathVariable UUID propertyId) {
        try {
            propertyValueService.deleteAllPropertyValues(propertyId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Ошибка при удалении всех значений свойства: " + e.getMessage());
        }
    }
} 
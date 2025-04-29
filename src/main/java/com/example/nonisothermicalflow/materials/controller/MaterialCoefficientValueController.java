package com.example.nonisothermicalflow.materials.controller;

import com.example.nonisothermicalflow.materials.model.MaterialCoefficientValue;
import com.example.nonisothermicalflow.materials.service.MaterialCoefficientValueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Контроллер для API работы со значениями эмпирических коэффициентов материалов
 */
@RestController
@RequestMapping("/api/material-coefficient-values")
@RequiredArgsConstructor
public class MaterialCoefficientValueController {

    private final MaterialCoefficientValueService coefficientValueService;

    /**
     * Получение всех значений коэффициентов для материала
     *
     * @param materialId идентификатор материала
     * @return список значений коэффициентов для материала
     */
    @GetMapping("/material/{materialId}")
    public ResponseEntity<List<MaterialCoefficientValue>> getMaterialCoefficients(@PathVariable UUID materialId) {
        try {
            List<MaterialCoefficientValue> coefficientValues = coefficientValueService.getMaterialCoefficients(materialId);
            return ResponseEntity.ok(coefficientValues);
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Ошибка при получении значений коэффициентов материала: " + e.getMessage());
        }
    }

    /**
     * Добавление значения коэффициента для материала
     *
     * @param materialId идентификатор материала
     * @param coefficientId идентификатор коэффициента
     * @param requestBody тело запроса с значением коэффициента
     * @return добавленное значение коэффициента
     */
    @PostMapping("/material/{materialId}/coefficient/{coefficientId}")
    public ResponseEntity<MaterialCoefficientValue> addCoefficientValue(
            @PathVariable UUID materialId,
            @PathVariable UUID coefficientId,
            @RequestBody Map<String, Double> requestBody) {
        try {
            Double value = requestBody.get("value");
            if (value == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Поле 'value' обязательно");
            }
            
            MaterialCoefficientValue coefficientValue = coefficientValueService.addCoefficientValue(
                    materialId, coefficientId, value);
            
            return new ResponseEntity<>(coefficientValue, HttpStatus.CREATED);
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Ошибка при добавлении значения коэффициента: " + e.getMessage());
        }
    }

    /**
     * Обновление значения коэффициента для материала
     *
     * @param materialId идентификатор материала
     * @param coefficientId идентификатор коэффициента
     * @param requestBody тело запроса с новым значением коэффициента
     * @return обновленное значение коэффициента
     */
    @PutMapping("/material/{materialId}/coefficient/{coefficientId}")
    public ResponseEntity<MaterialCoefficientValue> updateCoefficientValue(
            @PathVariable UUID materialId,
            @PathVariable UUID coefficientId,
            @RequestBody Map<String, Double> requestBody) {
        try {
            Double newValue = requestBody.get("value");
            if (newValue == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Поле 'value' обязательно");
            }
            
            MaterialCoefficientValue updatedValue = coefficientValueService.updateCoefficientValue(
                    materialId, coefficientId, newValue);
            
            return ResponseEntity.ok(updatedValue);
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Ошибка при обновлении значения коэффициента: " + e.getMessage());
        }
    }

    /**
     * Удаление значения коэффициента для материала
     *
     * @param materialId идентификатор материала
     * @param coefficientId идентификатор коэффициента
     * @return ответ без содержимого
     */
    @DeleteMapping("/material/{materialId}/coefficient/{coefficientId}")
    public ResponseEntity<Void> deleteCoefficientValue(
            @PathVariable UUID materialId,
            @PathVariable UUID coefficientId) {
        try {
            coefficientValueService.deleteCoefficientValue(materialId, coefficientId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Ошибка при удалении значения коэффициента: " + e.getMessage());
        }
    }

    /**
     * Удаление всех значений коэффициентов для материала
     *
     * @param materialId идентификатор материала
     * @return ответ без содержимого
     */
    @DeleteMapping("/material/{materialId}")
    public ResponseEntity<Void> deleteAllMaterialCoefficientValues(@PathVariable UUID materialId) {
        try {
            coefficientValueService.deleteAllMaterialCoefficientValues(materialId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Ошибка при удалении всех значений коэффициентов материала: " + e.getMessage());
        }
    }

    /**
     * Удаление всех значений для коэффициента
     *
     * @param coefficientId идентификатор коэффициента
     * @return ответ без содержимого
     */
    @DeleteMapping("/coefficient/{coefficientId}")
    public ResponseEntity<Void> deleteAllCoefficientValues(@PathVariable UUID coefficientId) {
        try {
            coefficientValueService.deleteAllCoefficientValues(coefficientId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Ошибка при удалении всех значений коэффициента: " + e.getMessage());
        }
    }
} 
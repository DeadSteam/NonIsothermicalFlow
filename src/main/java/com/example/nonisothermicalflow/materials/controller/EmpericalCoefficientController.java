package com.example.nonisothermicalflow.materials.controller;

import com.example.nonisothermicalflow.materials.model.EmpiricalCoefficient;
import com.example.nonisothermicalflow.materials.service.EmpericalCoefficientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

/**
 * Контроллер для API работы с эмпирическими коэффициентами
 */
@RestController
@RequestMapping("/api/v1/empirical-coefficients")
@RequiredArgsConstructor
public class EmpericalCoefficientController {
    
    private final EmpericalCoefficientService coefficientService;

    /**
     * Получение эмпирического коэффициента по ID
     *
     * @param id идентификатор коэффициента
     * @return эмпирический коэффициент
     */
    @GetMapping("/{id}")
    public ResponseEntity<EmpiricalCoefficient> getEmpiricalCoefficientById(@PathVariable UUID id) {
        try {
            EmpiricalCoefficient coefficient = coefficientService.getEmpiricalCoefficientById(id);
            return ResponseEntity.ok(coefficient);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Ошибка при получении эмпирического коэффициента: " + e.getMessage());
        }
    }

    /**
     * Получение всех эмпирических коэффициентов
     *
     * @return список всех эмпирических коэффициентов
     */
    @GetMapping
    public ResponseEntity<List<EmpiricalCoefficient>> getAllEmpiricalCoefficients() {
        try {
            List<EmpiricalCoefficient> coefficients = coefficientService.getAllEmpiricalCoefficients();
            return ResponseEntity.ok(coefficients);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Ошибка при получении списка эмпирических коэффициентов: " + e.getMessage());
        }
    }

    /**
     * Создание нового эмпирического коэффициента
     *
     * @param coefficient данные коэффициента для создания
     * @return созданный эмпирический коэффициент
     */
    @PostMapping
    public ResponseEntity<EmpiricalCoefficient> createEmpiricalCoefficient(@RequestBody EmpiricalCoefficient coefficient) {
        try {
            EmpiricalCoefficient createdCoefficient = coefficientService.createEmpiricalCoefficient(coefficient);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdCoefficient);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Ошибка при создании эмпирического коэффициента: " + e.getMessage());
        }
    }

    /**
     * Обновление эмпирического коэффициента
     *
     * @param id идентификатор коэффициента
     * @param coefficient обновленные данные коэффициента
     * @return обновленный эмпирический коэффициент
     */
    @PutMapping("/{id}")
    public ResponseEntity<EmpiricalCoefficient> updateEmpiricalCoefficient(
            @PathVariable UUID id, 
            @RequestBody EmpiricalCoefficient coefficient) {
        try {
            EmpiricalCoefficient updatedCoefficient = coefficientService.updateEmpiricalCoefficient(id, coefficient);
            return ResponseEntity.ok(updatedCoefficient);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (IllegalStateException e) {
            if (e.getMessage().contains("не найден")) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
            }
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Ошибка при обновлении эмпирического коэффициента: " + e.getMessage());
        }
    }

    /**
     * Удаление эмпирического коэффициента
     *
     * @param id идентификатор коэффициента
     * @return пустой ответ с кодом 204
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmpiricalCoefficient(@PathVariable UUID id) {
        try {
            coefficientService.deleteEmpiricalCoefficient(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Ошибка при удалении эмпирического коэффициента: " + e.getMessage());
        }
    }
} 
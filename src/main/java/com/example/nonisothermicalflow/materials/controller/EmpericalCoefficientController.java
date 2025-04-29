package com.example.nonisothermicalflow.materials.controller;

import com.example.nonisothermicalflow.materials.model.EmpiricalCoefficient;
import com.example.nonisothermicalflow.materials.service.EmpericalCoefficientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/empirical-coefficients")
@RequiredArgsConstructor
public class EmpericalCoefficientController {
    
    private final EmpericalCoefficientService coefficientService;

    @GetMapping("/{id}")
    public ResponseEntity<EmpiricalCoefficient> getEmpiricalCoefficientById(@PathVariable UUID id) {
        try {
            EmpiricalCoefficient coefficient = coefficientService.getEmpiricalCoefficientById(id);
            return ResponseEntity.ok(coefficient);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<EmpiricalCoefficient>> getAllEmpiricalCoefficients() {
        try {
            List<EmpiricalCoefficient> coefficients = coefficientService.getAllEmpiricalCoefficients();
            return ResponseEntity.ok(coefficients);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    public ResponseEntity<EmpiricalCoefficient> createEmpiricalCoefficient(@RequestBody EmpiricalCoefficient coefficient) {
        try {
            EmpiricalCoefficient createdCoefficient = coefficientService.createEmpiricalCoefficient(coefficient);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdCoefficient);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmpiricalCoefficient> updateEmpiricalCoefficient(
            @PathVariable UUID id, 
            @RequestBody EmpiricalCoefficient coefficient) {
        try {
            EmpiricalCoefficient updatedCoefficient = coefficientService.updateEmpiricalCoefficient(id, coefficient);
            return ResponseEntity.ok(updatedCoefficient);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            if (e.getMessage().contains("не найден")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmpiricalCoefficient(@PathVariable UUID id) {
        try {
            coefficientService.deleteEmpiricalCoefficient(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
} 
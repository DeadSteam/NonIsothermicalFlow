package com.example.nonisothermicalflow.materials.controller;

import com.example.nonisothermicalflow.materials.model.MaterialProperty;
import com.example.nonisothermicalflow.materials.service.MaterialPropertyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/material-properties")
@RequiredArgsConstructor
public class MaterialPropertyController {
    
    private final MaterialPropertyService propertyService;

    @GetMapping("/{id}")
    public ResponseEntity<MaterialProperty> getMaterialPropertyById(@PathVariable UUID id) {
        try {
            MaterialProperty property = propertyService.getMaterialPropertyById(id);
            return ResponseEntity.ok(property);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<MaterialProperty>> getAllMaterialProperties() {
        try {
            List<MaterialProperty> properties = propertyService.getAllMaterialProperties();
            return ResponseEntity.ok(properties);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    public ResponseEntity<MaterialProperty> createMaterialProperty(@RequestBody MaterialProperty property) {
        try {
            MaterialProperty createdProperty = propertyService.createMaterialProperty(property);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdProperty);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaterialProperty> updateMaterialProperty(
            @PathVariable UUID id, 
            @RequestBody MaterialProperty property) {
        try {
            MaterialProperty updatedProperty = propertyService.updateMaterialProperty(id, property);
            return ResponseEntity.ok(updatedProperty);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            if (e.getMessage().contains("не найдено")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaterialProperty(@PathVariable UUID id) {
        try {
            propertyService.deleteMaterialProperty(id);
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
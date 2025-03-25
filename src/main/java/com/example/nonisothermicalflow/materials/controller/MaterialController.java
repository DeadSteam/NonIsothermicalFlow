package com.example.nonisothermicalflow.materials.controller;

import com.example.nonisothermicalflow.materials.model.Material;
import com.example.nonisothermicalflow.materials.service.MaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/materials")
@RequiredArgsConstructor
public class MaterialController {
    
    private final MaterialService materialService;

    @GetMapping("/{id}")
    public ResponseEntity<Material> getMaterialById(@PathVariable UUID id) {
        try {
            Material material = materialService.getMaterialById(id);
            return ResponseEntity.ok(material);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Material>> getAllMaterials() {
        try {
            List<Material> materials = materialService.getAllMaterials();
            return ResponseEntity.ok(materials);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    public ResponseEntity<Material> createMaterial(@RequestBody Material material) {
        try {
            Material createdMaterial = materialService.createMaterial(material);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdMaterial);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Material> updateMaterial(@PathVariable UUID id, @RequestBody Material material) {
        try {
            Material updatedMaterial = materialService.updateMaterial(id, material);
            return ResponseEntity.ok(updatedMaterial);
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
    public ResponseEntity<Void> deleteMaterial(@PathVariable UUID id) {
        try {
            materialService.deleteMaterial(id);
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

 
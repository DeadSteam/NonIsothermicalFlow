package com.example.nonisothermicalflow.controller;

import com.example.nonisothermicalflow.model.Material;
import com.example.nonisothermicalflow.service.MaterialService;
import org.springframework.security.access.prepost.PreAuthorize; // Добавьте этот импорт
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/materials")
public class MaterialController {

    private final MaterialService materialService;

    public MaterialController(MaterialService materialService) {
        this.materialService = materialService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')") // Теперь ошибка должна исчезнуть
    public List<Material> getAllMaterials() {
        return materialService.getAllMaterials();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Material createMaterial(@RequestBody Material material) {
        return materialService.createMaterial(material);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Material updateMaterial(@PathVariable Long id, @RequestBody Material material) {
        return materialService.updateMaterial(id, material);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteMaterial(@PathVariable Long id) {
        materialService.deleteMaterial(id);
    }
}
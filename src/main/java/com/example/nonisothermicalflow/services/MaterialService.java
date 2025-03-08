package com.example.nonisothermicalflow.service;

import com.example.nonisothermicalflow.model.Material;
import com.example.nonisothermicalflow.repository.MaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MaterialService {

    private final MaterialRepository materialRepository;

    public List<Material> getAllMaterials() {
        return materialRepository.findAll();
    }

    public Material getMaterialById(Long id) {
        return materialRepository.findById(id).orElseThrow(() -> new RuntimeException("Material not found"));
    }

    public Material createMaterial(Material material) {
        return materialRepository.save(material);
    }

    public Material updateMaterial(Long id, Material material) {
        Material existingMaterial = getMaterialById(id);
        existingMaterial.setName(material.getName());
        existingMaterial.setChemicalComposition(material.getChemicalComposition());
        existingMaterial.setMaterialType(material.getMaterialType());
        return materialRepository.save(existingMaterial);
    }

    public void deleteMaterial(Long id) {
        materialRepository.deleteById(id);
    }
}
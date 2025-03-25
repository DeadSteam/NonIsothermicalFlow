package com.example.nonisothermicalflow.materials.service;

import com.example.nonisothermicalflow.materials.model.Material;
import com.example.nonisothermicalflow.materials.repository.MaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MaterialService {
    
    private final MaterialRepository materialRepository;
    private final MaterialDeletionService deletionService;

    @Transactional(readOnly = true)
    public Material getMaterialById(UUID id) {
        try {
            if (id == null) {
                throw new IllegalArgumentException("ID материала не может быть null");
            }
            
            return materialRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Материал не найден с ID: " + id));
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при получении материала: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public List<Material> getAllMaterials() {
        try {
            return materialRepository.findAll();
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при получении списка материалов: " + e.getMessage(), e);
        }
    }

    @Transactional
    public Material createMaterial(Material material) {
        try {
            if (material == null) {
                throw new IllegalArgumentException("Материал не может быть null");
            }
            
            if (material.getName() == null || material.getName().trim().isEmpty()) {
                throw new IllegalArgumentException("Название материала не может быть пустым");
            }
            
            if (material.getMaterialType() == null) {
                throw new IllegalArgumentException("Тип материала не может быть null");
            }
            
            // Проверяем уникальность имени материала
            if (materialRepository.findByName(material.getName()).isPresent()) {
                throw new IllegalStateException("Материал с названием '" + material.getName() + "' уже существует");
            }
            
            return materialRepository.save(material);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при создании материала: " + e.getMessage(), e);
        }
    }

    @Transactional
    public Material updateMaterial(UUID id, Material updatedMaterial) {
        try {
            if (id == null) {
                throw new IllegalArgumentException("ID материала не может быть null");
            }
            
            if (updatedMaterial == null) {
                throw new IllegalArgumentException("Обновленный материал не может быть null");
            }
            
            if (updatedMaterial.getName() == null || updatedMaterial.getName().trim().isEmpty()) {
                throw new IllegalArgumentException("Название материала не может быть пустым");
            }
            
            if (updatedMaterial.getMaterialType() == null) {
                throw new IllegalArgumentException("Тип материала не может быть null");
            }
            
            Material existingMaterial = getMaterialById(id);
            
            // Проверяем уникальность имени, если оно изменилось
            if (!existingMaterial.getName().equals(updatedMaterial.getName()) && 
                materialRepository.findByName(updatedMaterial.getName()).isPresent()) {
                throw new IllegalStateException("Материал с названием '" + updatedMaterial.getName() + "' уже существует");
            }
            
            existingMaterial.setName(updatedMaterial.getName());
            existingMaterial.setMaterialType(updatedMaterial.getMaterialType());
            
            return materialRepository.save(existingMaterial);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при обновлении материала: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void deleteMaterial(UUID id) {
        try {
            if (id == null) {
                throw new IllegalArgumentException("ID материала не может быть null");
            }
            
            Material material = getMaterialById(id);
            
            // Удаляем все связанные значения свойств и коэффициентов
            deletionService.deleteAllMaterialValues(id);
            
            materialRepository.delete(material);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при удалении материала: " + e.getMessage(), e);
        }
    }
} 
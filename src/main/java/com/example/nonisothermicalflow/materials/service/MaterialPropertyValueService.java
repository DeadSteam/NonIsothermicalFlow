package com.example.nonisothermicalflow.materials.service;

import com.example.nonisothermicalflow.materials.model.Material;
import com.example.nonisothermicalflow.materials.model.MaterialProperty;
import com.example.nonisothermicalflow.materials.model.MaterialPropertyValue;
import com.example.nonisothermicalflow.materials.repository.MaterialPropertyValueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MaterialPropertyValueService {
    
    private final MaterialPropertyValueRepository propertyValueRepository;
    private final MaterialService materialService;
    private final MaterialPropertyService propertyService;

    @Transactional
    public MaterialPropertyValue addPropertyValue(UUID materialId, UUID propertyId, Double value) {
        try {
            if (value == null) {
                throw new IllegalArgumentException("Значение свойства не может быть null");
            }
            
            Material material = materialService.getMaterialById(materialId);
            MaterialProperty property = propertyService.getMaterialPropertyById(propertyId);
            
            // Проверяем, не существует ли уже значение для этой комбинации материал-свойство
            if (propertyValueRepository.findByMaterialAndProperty(material, property).isPresent()) {
                throw new IllegalStateException("Значение свойства уже существует для материала с ID: " + 
                    materialId + " и свойства с ID: " + propertyId);
            }
            
            // Используем новый конструктор для автоматической инициализации составного ключа
            MaterialPropertyValue propertyValue = new MaterialPropertyValue(material, property, value);

            return propertyValueRepository.save(propertyValue);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при добавлении значения свойства: " + e.getMessage(), e);
        }
    }

    @Transactional
    public MaterialPropertyValue updatePropertyValue(UUID materialId, UUID propertyId, Double newValue) {
        try {
            if (newValue == null) {
                throw new IllegalArgumentException("Новое значение свойства не может быть null");
            }
            
            Material material = materialService.getMaterialById(materialId);
            MaterialProperty property = propertyService.getMaterialPropertyById(propertyId);
            
            MaterialPropertyValue propertyValue = propertyValueRepository.findByMaterialAndProperty(material, property)
                .orElseThrow(() -> new IllegalStateException("Значение свойства не найдено для материала с ID: " + 
                    materialId + " и свойства с ID: " + propertyId));
            
            propertyValue.setPropertyValue(newValue);
            return propertyValueRepository.save(propertyValue);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при обновлении значения свойства: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public List<MaterialPropertyValue> getMaterialProperties(UUID materialId) {
        try {
            if (materialId == null) {
                throw new IllegalArgumentException("ID материала не может быть null");
            }
            
            // Проверяем существование материала
            materialService.getMaterialById(materialId);
            
            return propertyValueRepository.findByMaterialId(materialId);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при получении значений свойств материала: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void deletePropertyValue(UUID materialId, UUID propertyId) {
        try {
            if (materialId == null || propertyId == null) {
                throw new IllegalArgumentException("ID материала и свойства не могут быть null");
            }
            
            Material material = materialService.getMaterialById(materialId);
            MaterialProperty property = propertyService.getMaterialPropertyById(propertyId);
            
            // Проверяем существование значения перед удалением
            if (!propertyValueRepository.findByMaterialAndProperty(material, property).isPresent()) {
                throw new IllegalStateException("Значение свойства не найдено для материала с ID: " + 
                    materialId + " и свойства с ID: " + propertyId);
            }
            
            propertyValueRepository.deleteByMaterialAndProperty(material, property);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при удалении значения свойства: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void deleteAllMaterialPropertyValues(UUID materialId) {
        try {
            if (materialId == null) {
                throw new IllegalArgumentException("ID материала не может быть null");
            }
            
            // Проверяем существование материала
            materialService.getMaterialById(materialId);
            
            propertyValueRepository.deleteByMaterialId(materialId);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при удалении всех значений свойств материала: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void deleteAllPropertyValues(UUID propertyId) {
        try {
            if (propertyId == null) {
                throw new IllegalArgumentException("ID свойства не может быть null");
            }
            
            // Проверяем существование свойства
            propertyService.getMaterialPropertyById(propertyId);
            
            propertyValueRepository.deleteByPropertyId(propertyId);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при удалении всех значений свойства: " + e.getMessage(), e);
        }
    }
} 
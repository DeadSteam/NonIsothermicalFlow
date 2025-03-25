package com.example.nonisothermicalflow.materials.service;

import com.example.nonisothermicalflow.materials.model.MaterialProperty;
import com.example.nonisothermicalflow.materials.repository.MaterialPropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MaterialPropertyService {
    
    private final MaterialPropertyRepository propertyRepository;
    private final MaterialDeletionService deletionService;

    @Transactional(readOnly = true)
    public MaterialProperty getMaterialPropertyById(UUID id) {
        try {
            if (id == null) {
                throw new IllegalArgumentException("ID свойства не может быть null");
            }
            
            return propertyRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Свойство материала не найдено с ID: " + id));
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при получении свойства материала: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public List<MaterialProperty> getAllMaterialProperties() {
        try {
            return propertyRepository.findAll();
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при получении списка свойств материалов: " + e.getMessage(), e);
        }
    }

    @Transactional
    public MaterialProperty createMaterialProperty(MaterialProperty property) {
        try {
            if (property == null) {
                throw new IllegalArgumentException("Свойство не может быть null");
            }
            
            if (property.getPropertyName() == null || property.getPropertyName().trim().isEmpty()) {
                throw new IllegalArgumentException("Название свойства не может быть пустым");
            }
            
            if (property.getUnitOfMeasurement() == null || property.getUnitOfMeasurement().trim().isEmpty()) {
                throw new IllegalArgumentException("Единица измерения не может быть пустой");
            }
            
            // Проверяем уникальность имени свойства
            if (propertyRepository.findByPropertyName(property.getPropertyName()).isPresent()) {
                throw new IllegalStateException("Свойство с названием '" + property.getPropertyName() + "' уже существует");
            }
            
            return propertyRepository.save(property);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при создании свойства материала: " + e.getMessage(), e);
        }
    }

    @Transactional
    public MaterialProperty updateMaterialProperty(UUID id, MaterialProperty updatedProperty) {
        try {
            if (id == null) {
                throw new IllegalArgumentException("ID свойства не может быть null");
            }
            
            if (updatedProperty == null) {
                throw new IllegalArgumentException("Обновленное свойство не может быть null");
            }
            
            if (updatedProperty.getPropertyName() == null || updatedProperty.getPropertyName().trim().isEmpty()) {
                throw new IllegalArgumentException("Название свойства не может быть пустым");
            }
            
            if (updatedProperty.getUnitOfMeasurement() == null || updatedProperty.getUnitOfMeasurement().trim().isEmpty()) {
                throw new IllegalArgumentException("Единица измерения не может быть пустой");
            }
            
            MaterialProperty existingProperty = getMaterialPropertyById(id);
            
            // Проверяем уникальность имени, если оно изменилось
            if (!existingProperty.getPropertyName().equals(updatedProperty.getPropertyName()) && 
                propertyRepository.findByPropertyName(updatedProperty.getPropertyName()).isPresent()) {
                throw new IllegalStateException("Свойство с названием '" + updatedProperty.getPropertyName() + "' уже существует");
            }
            
            existingProperty.setPropertyName(updatedProperty.getPropertyName());
            existingProperty.setUnitOfMeasurement(updatedProperty.getUnitOfMeasurement());
            
            return propertyRepository.save(existingProperty);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при обновлении свойства материала: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void deleteMaterialProperty(UUID id) {
        try {
            if (id == null) {
                throw new IllegalArgumentException("ID свойства не может быть null");
            }
            
            MaterialProperty property = getMaterialPropertyById(id);
            
            // Удаляем все связанные значения свойства
            deletionService.deleteAllPropertyValues(id);
            
            propertyRepository.delete(property);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при удалении свойства материала: " + e.getMessage(), e);
        }
    }
} 
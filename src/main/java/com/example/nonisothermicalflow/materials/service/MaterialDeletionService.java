package com.example.nonisothermicalflow.materials.service;

import com.example.nonisothermicalflow.materials.model.Material;
import com.example.nonisothermicalflow.materials.model.MaterialProperty;
import com.example.nonisothermicalflow.materials.model.EmpiricalCoefficient;
import com.example.nonisothermicalflow.materials.repository.MaterialPropertyValueRepository;
import com.example.nonisothermicalflow.materials.repository.MaterialCoefficientValueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MaterialDeletionService {
    
    private final MaterialPropertyValueRepository propertyValueRepository;
    private final MaterialCoefficientValueRepository coefficientValueRepository;

    @Transactional
    public void deleteAllMaterialValues(UUID materialId) {
        try {
            if (materialId == null) {
                throw new IllegalArgumentException("ID материала не может быть null");
            }
            
            propertyValueRepository.deleteByMaterialId(materialId);
            coefficientValueRepository.deleteByMaterialId(materialId);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при удалении значений материала: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void deleteAllPropertyValues(UUID propertyId) {
        try {
            if (propertyId == null) {
                throw new IllegalArgumentException("ID свойства не может быть null");
            }
            
            propertyValueRepository.deleteByPropertyId(propertyId);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при удалении значений свойства: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void deleteAllCoefficientValues(UUID coefficientId) {
        try {
            if (coefficientId == null) {
                throw new IllegalArgumentException("ID коэффициента не может быть null");
            }
            
            coefficientValueRepository.deleteByCoefficientId(coefficientId);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при удалении значений коэффициента: " + e.getMessage(), e);
        }
    }
} 
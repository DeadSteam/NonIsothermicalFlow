package com.example.nonisothermicalflow.materials.service;

import com.example.nonisothermicalflow.materials.model.Material;
import com.example.nonisothermicalflow.materials.model.EmpiricalCoefficient;
import com.example.nonisothermicalflow.materials.model.MaterialCoefficientValue;
import com.example.nonisothermicalflow.materials.repository.MaterialCoefficientValueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MaterialCoefficientValueService {
    
    private final MaterialCoefficientValueRepository coefficientValueRepository;
    private final MaterialService materialService;
    private final EmpericalCoefficientService coefficientService;

    @Transactional
    public MaterialCoefficientValue addCoefficientValue(UUID materialId, UUID coefficientId, Double value) {
        try {
            if (value == null) {
                throw new IllegalArgumentException("Значение коэффициента не может быть null");
            }
            
            Material material = materialService.getMaterialById(materialId);
            EmpiricalCoefficient coefficient = coefficientService.getEmpiricalCoefficientById(coefficientId);
            
            // Проверяем, не существует ли уже значение для этой комбинации материал-коэффициент
            if (coefficientValueRepository.findByMaterialAndCoefficient(material, coefficient).isPresent()) {
                throw new IllegalStateException("Значение коэффициента уже существует для материала с ID: " + 
                    materialId + " и коэффициента с ID: " + coefficientId);
            }
            
            // Используем новый конструктор для автоматической инициализации составного ключа
            MaterialCoefficientValue coefficientValue = new MaterialCoefficientValue(material, coefficient, value);

            return coefficientValueRepository.save(coefficientValue);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при добавлении значения коэффициента: " + e.getMessage(), e);
        }
    }

    @Transactional
    public MaterialCoefficientValue updateCoefficientValue(UUID materialId, UUID coefficientId, Double newValue) {
        try {
            if (newValue == null) {
                throw new IllegalArgumentException("Новое значение коэффициента не может быть null");
            }
            
            Material material = materialService.getMaterialById(materialId);
            EmpiricalCoefficient coefficient = coefficientService.getEmpiricalCoefficientById(coefficientId);
            
            MaterialCoefficientValue coefficientValue = coefficientValueRepository.findByMaterialAndCoefficient(material, coefficient)
                .orElseThrow(() -> new IllegalStateException("Значение коэффициента не найдено для материала с ID: " + 
                    materialId + " и коэффициента с ID: " + coefficientId));
            
            coefficientValue.setCoefficientValue(newValue);
            return coefficientValueRepository.save(coefficientValue);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при обновлении значения коэффициента: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public List<MaterialCoefficientValue> getMaterialCoefficients(UUID materialId) {
        try {
            if (materialId == null) {
                throw new IllegalArgumentException("ID материала не может быть null");
            }
            
            // Проверяем существование материала
            materialService.getMaterialById(materialId);
            
            return coefficientValueRepository.findByMaterialId(materialId);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при получении значений коэффициентов материала: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void deleteCoefficientValue(UUID materialId, UUID coefficientId) {
        try {
            if (materialId == null || coefficientId == null) {
                throw new IllegalArgumentException("ID материала и коэффициента не могут быть null");
            }
            
            Material material = materialService.getMaterialById(materialId);
            EmpiricalCoefficient coefficient = coefficientService.getEmpiricalCoefficientById(coefficientId);
            
            // Проверяем существование значения перед удалением
            if (!coefficientValueRepository.findByMaterialAndCoefficient(material, coefficient).isPresent()) {
                throw new IllegalStateException("Значение коэффициента не найдено для материала с ID: " + 
                    materialId + " и коэффициента с ID: " + coefficientId);
            }
            
            coefficientValueRepository.deleteByMaterialAndCoefficient(material, coefficient);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при удалении значения коэффициента: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void deleteAllMaterialCoefficientValues(UUID materialId) {
        try {
            if (materialId == null) {
                throw new IllegalArgumentException("ID материала не может быть null");
            }
            
            // Проверяем существование материала
            materialService.getMaterialById(materialId);
            
            coefficientValueRepository.deleteByMaterialId(materialId);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при удалении всех значений коэффициентов материала: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void deleteAllCoefficientValues(UUID coefficientId) {
        try {
            if (coefficientId == null) {
                throw new IllegalArgumentException("ID коэффициента не может быть null");
            }
            
            // Проверяем существование коэффициента
            coefficientService.getEmpiricalCoefficientById(coefficientId);
            
            coefficientValueRepository.deleteByCoefficientId(coefficientId);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при удалении всех значений коэффициента: " + e.getMessage(), e);
        }
    }
} 
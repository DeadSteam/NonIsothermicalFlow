package com.example.nonisothermicalflow.materials.service;

import com.example.nonisothermicalflow.materials.model.EmpiricalCoefficient;
import com.example.nonisothermicalflow.materials.repository.EmpiricalCoefficientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmpericalCoefficientService {
    
    private final EmpiricalCoefficientRepository coefficientRepository;
    private final MaterialDeletionService deletionService;

    @Transactional(readOnly = true)
    public EmpiricalCoefficient getEmpiricalCoefficientById(UUID id) {
        try {
            if (id == null) {
                throw new IllegalArgumentException("ID коэффициента не может быть null");
            }
            
            return coefficientRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Эмпирический коэффициент не найден с ID: " + id));
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при получении эмпирического коэффициента: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public List<EmpiricalCoefficient> getAllEmpiricalCoefficients() {
        try {
            return coefficientRepository.findAll();
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при получении списка эмпирических коэффициентов: " + e.getMessage(), e);
        }
    }

    @Transactional
    public EmpiricalCoefficient createEmpiricalCoefficient(EmpiricalCoefficient coefficient) {
        try {
            if (coefficient == null) {
                throw new IllegalArgumentException("Коэффициент не может быть null");
            }
            
            if (coefficient.getCoefficientName() == null || coefficient.getCoefficientName().trim().isEmpty()) {
                throw new IllegalArgumentException("Название коэффициента не может быть пустым");
            }
            
            if (coefficient.getUnitOfMeasurement() == null || coefficient.getUnitOfMeasurement().trim().isEmpty()) {
                throw new IllegalArgumentException("Единица измерения не может быть пустой");
            }
            
            // Проверяем уникальность имени коэффициента
            if (coefficientRepository.findByCoefficientName(coefficient.getCoefficientName()).isPresent()) {
                throw new IllegalStateException("Коэффициент с названием '" + coefficient.getCoefficientName() + "' уже существует");
            }
            
            return coefficientRepository.save(coefficient);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при создании эмпирического коэффициента: " + e.getMessage(), e);
        }
    }

    @Transactional
    public EmpiricalCoefficient updateEmpiricalCoefficient(UUID id, EmpiricalCoefficient updatedCoefficient) {
        try {
            if (id == null) {
                throw new IllegalArgumentException("ID коэффициента не может быть null");
            }
            
            if (updatedCoefficient == null) {
                throw new IllegalArgumentException("Обновленный коэффициент не может быть null");
            }
            
            if (updatedCoefficient.getCoefficientName() == null || updatedCoefficient.getCoefficientName().trim().isEmpty()) {
                throw new IllegalArgumentException("Название коэффициента не может быть пустым");
            }
            
            if (updatedCoefficient.getUnitOfMeasurement() == null || updatedCoefficient.getUnitOfMeasurement().trim().isEmpty()) {
                throw new IllegalArgumentException("Единица измерения не может быть пустой");
            }
            
            EmpiricalCoefficient existingCoefficient = getEmpiricalCoefficientById(id);
            
            // Проверяем уникальность имени, если оно изменилось
            if (!existingCoefficient.getCoefficientName().equals(updatedCoefficient.getCoefficientName()) && 
                coefficientRepository.findByCoefficientName(updatedCoefficient.getCoefficientName()).isPresent()) {
                throw new IllegalStateException("Коэффициент с названием '" + updatedCoefficient.getCoefficientName() + "' уже существует");
            }
            
            existingCoefficient.setCoefficientName(updatedCoefficient.getCoefficientName());
            existingCoefficient.setUnitOfMeasurement(updatedCoefficient.getUnitOfMeasurement());
            
            return coefficientRepository.save(existingCoefficient);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при обновлении эмпирического коэффициента: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void deleteEmpiricalCoefficient(UUID id) {
        try {
            if (id == null) {
                throw new IllegalArgumentException("ID коэффициента не может быть null");
            }
            
            EmpiricalCoefficient coefficient = getEmpiricalCoefficientById(id);
            
            // Удаляем все связанные значения коэффициента
            deletionService.deleteAllCoefficientValues(id);
            
            coefficientRepository.delete(coefficient);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при удалении эмпирического коэффициента: " + e.getMessage(), e);
        }
    }
}

package com.example.nonisothermicalflow.materials.repository;

import com.example.nonisothermicalflow.materials.model.MaterialCoefficientValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MaterialCoefficientValueRepository extends JpaRepository<MaterialCoefficientValue, UUID> {
    List<MaterialCoefficientValue> findByMaterialId(UUID materialId);
    List<MaterialCoefficientValue> findByCoefficientId(UUID coefficientId);
    MaterialCoefficientValue findByMaterialIdAndCoefficientId(UUID materialId, UUID coefficientId);
} 
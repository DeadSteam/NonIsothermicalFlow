package com.example.nonisothermicalflow.materials.repository;

import com.example.nonisothermicalflow.materials.model.Material;
import com.example.nonisothermicalflow.materials.model.EmpiricalCoefficient;
import com.example.nonisothermicalflow.materials.model.MaterialCoefficientValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MaterialCoefficientValueRepository extends JpaRepository<MaterialCoefficientValue, UUID> {
    
    List<MaterialCoefficientValue> findByMaterialId(UUID materialId);
    
    Optional<MaterialCoefficientValue> findByMaterialAndCoefficient(Material material, EmpiricalCoefficient coefficient);
    
    @Modifying
    @Query("DELETE FROM MaterialCoefficientValue mcv WHERE mcv.material = :material AND mcv.coefficient = :coefficient")
    void deleteByMaterialAndCoefficient(Material material, EmpiricalCoefficient coefficient);
    
    @Modifying
    @Query("DELETE FROM MaterialCoefficientValue mcv WHERE mcv.material.id = :materialId")
    void deleteByMaterialId(UUID materialId);
    
    @Modifying
    @Query("DELETE FROM MaterialCoefficientValue mcv WHERE mcv.coefficient.id = :coefficientId")
    void deleteByCoefficientId(UUID coefficientId);
} 
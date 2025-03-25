package com.example.nonisothermicalflow.materials.repository;

import com.example.nonisothermicalflow.materials.model.EmpiricalCoefficient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmpiricalCoefficientRepository extends JpaRepository<EmpiricalCoefficient, UUID> {
    Optional<EmpiricalCoefficient> findByCoefficientName(String coefficientName);
    boolean existsByCoefficientName(String coefficientName);

}

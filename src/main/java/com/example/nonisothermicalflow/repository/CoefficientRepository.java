package com.example.nonisothermicalflow.repository;

import com.example.nonisothermicalflow.model.Coefficient;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CoefficientRepository extends JpaRepository<Coefficient, Long> {
}
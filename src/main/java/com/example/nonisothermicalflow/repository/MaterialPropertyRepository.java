package com.example.nonisothermicalflow.repository;

import com.example.nonisothermicalflow.model.MaterialProperty;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaterialPropertyRepository extends JpaRepository<MaterialProperty, Long> {
}
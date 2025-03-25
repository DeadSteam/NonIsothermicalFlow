package com.example.nonisothermicalflow.materials.repository;

import com.example.nonisothermicalflow.materials.model.MaterialProperty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MaterialPropertyRepository extends JpaRepository<MaterialProperty, UUID> {
    Optional<MaterialProperty> findByPropertyName(String propertyName);
    boolean existsByPropertyName(String propertyName);
}


package com.example.nonisothermicalflow.materials.repository;

import com.example.nonisothermicalflow.materials.model.MaterialPropertyValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MaterialPropertyValueRepository extends JpaRepository<MaterialPropertyValue, UUID> {
    List<MaterialPropertyValue> findByMaterialId(UUID materialId);
    List<MaterialPropertyValue> findByPropertyId(UUID propertyId);
    MaterialPropertyValue findByMaterialIdAndPropertyId(UUID materialId, UUID propertyId);
} 
package com.example.nonisothermicalflow.materials.repository;

import com.example.nonisothermicalflow.materials.model.Material;
import com.example.nonisothermicalflow.materials.model.MaterialProperty;
import com.example.nonisothermicalflow.materials.model.MaterialPropertyValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MaterialPropertyValueRepository extends JpaRepository<MaterialPropertyValue, UUID> {
    List<MaterialPropertyValue> findByMaterialId(UUID materialId);
    List<MaterialPropertyValue> findByPropertyId(UUID propertyId);
    MaterialPropertyValue findByMaterialIdAndPropertyId(UUID materialId, UUID propertyId);
    
    Optional<MaterialPropertyValue> findByMaterialAndProperty(Material material, MaterialProperty property);
    
    @Modifying
    @Query("DELETE FROM MaterialPropertyValue mpv WHERE mpv.material = :material AND mpv.property = :property")
    void deleteByMaterialAndProperty(Material material, MaterialProperty property);

    @Modifying
    @Query("DELETE FROM MaterialPropertyValue mpv WHERE mpv.property.id = :propertyId")
    void deleteByPropertyId(UUID propertyId);

    @Modifying
    @Query("DELETE FROM MaterialPropertyValue mpv WHERE mpv.material.id = :materialId")
    void deleteByMaterialId(UUID materialId);
} 
package com.example.nonisothermicalflow.materials.repository;

import com.example.nonisothermicalflow.materials.model.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MaterialRepository extends JpaRepository<Material, UUID> {
    Optional<Material> findByName(String name);
    List<Material> findByMaterialType(String materialType);
    boolean existsByName(String name);
}
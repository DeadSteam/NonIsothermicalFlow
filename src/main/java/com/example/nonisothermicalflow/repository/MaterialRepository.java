package com.example.nonisothermicalflow.repository;

import com.example.nonisothermicalflow.model.Material;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaterialRepository extends JpaRepository<Material, Long> {
}
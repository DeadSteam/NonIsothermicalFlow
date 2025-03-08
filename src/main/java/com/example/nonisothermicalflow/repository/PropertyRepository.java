package com.example.nonisothermicalflow.repository;

import com.example.nonisothermicalflow.model.Property;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PropertyRepository extends JpaRepository<Property, Long> {
}
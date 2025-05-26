package com.example.nonisothermicalflow.materials.model;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class MaterialCoefficientValueId implements Serializable {
    private Long materialId;
    private Long coefficientId;
    private Double temperature;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MaterialCoefficientValueId that = (MaterialCoefficientValueId) o;
        return Objects.equals(materialId, that.materialId) &&
               Objects.equals(coefficientId, that.coefficientId) &&
               Objects.equals(temperature, that.temperature);
    }

    @Override
    public int hashCode() {
        return Objects.hash(materialId, coefficientId, temperature);
    }
} 
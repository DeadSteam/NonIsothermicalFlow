package com.example.nonisothermicalflow.materials.model;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class MaterialPropertyValueId implements Serializable {
    private Long materialId;
    private Long propertyId;
    private Double temperature;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MaterialPropertyValueId that = (MaterialPropertyValueId) o;
        return Objects.equals(materialId, that.materialId) &&
               Objects.equals(propertyId, that.propertyId) &&
               Objects.equals(temperature, that.temperature);
    }

    @Override
    public int hashCode() {
        return Objects.hash(materialId, propertyId, temperature);
    }
} 
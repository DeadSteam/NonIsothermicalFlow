package com.example.nonisothermicalflow.materials.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(name = "material_coefficient")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MaterialCoefficientValue {

    @EmbeddedId
    private MaterialCoefficientValueId id;

    @ManyToOne
    @MapsId("materialId")
    @JoinColumn(name = "ID_material")
    @JsonBackReference
    private Material material;

    @ManyToOne
    @MapsId("coefficientId")
    @JoinColumn(name = "ID_coefficient")
    private EmpiricalCoefficient coefficient;

    @NotNull(message = "Значение коэффициента не может быть пустым")
    @Column(name = "coefficient_value", nullable = false)
    private Double coefficientValue;
}


@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
class MaterialCoefficientValueId implements Serializable {
    private UUID materialId;
    private UUID coefficientId;
}
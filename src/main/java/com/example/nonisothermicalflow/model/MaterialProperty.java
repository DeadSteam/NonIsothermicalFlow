package com.example.nonisothermicalflow.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "material_properties")
@Getter
@Setter
public class MaterialProperty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_material_property")
    private Long idMaterialProperty;

    @ManyToOne
    @JoinColumn(name = "id_material", nullable = false)
    private Material material;

    @ManyToOne
    @JoinColumn(name = "id_property", nullable = false)
    private Property property;

    @Column(name = "value")
    private Double value;
}
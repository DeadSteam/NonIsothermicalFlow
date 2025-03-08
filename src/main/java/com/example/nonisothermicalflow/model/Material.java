package com.example.nonisothermicalflow.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Entity
@Table(name = "materials")
@Getter
@Setter
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_material")
    private Long idMaterial;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "chemical_composition")
    private String chemicalComposition;

    @Column(name = "material_type")
    private String materialType;

    @OneToMany(mappedBy = "material", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<MaterialProperty> materialProperties;
}
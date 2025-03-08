package com.example.nonisothermicalflow.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Entity
@Table(name = "properties")
@Getter
@Setter
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_property")
    private Long idProperty;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "unit")
    private String unit;

    @Column(name = "value")
    private Double value;

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<MaterialProperty> materialProperties;

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<PropertyCoefficient> propertyCoefficients;
}
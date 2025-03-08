package com.example.nonisothermicalflow.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "property_coefficients")
@Getter
@Setter
public class PropertyCoefficient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_property_coefficient")
    private Long idPropertyCoefficient;

    @ManyToOne
    @JoinColumn(name = "id_property", nullable = false)
    private Property property;

    @ManyToOne
    @JoinColumn(name = "id_coefficient", nullable = false)
    private Coefficient coefficient;
}
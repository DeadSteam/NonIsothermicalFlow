package com.example.nonisothermicalflow.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Set; // Добавьте этот импорт

@Entity
@Table(name = "coefficients")
@Getter
@Setter
public class Coefficient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_coefficient")
    private Long idCoefficient;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "formula")
    private String formula;

    @OneToMany(mappedBy = "coefficient", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<PropertyCoefficient> propertyCoefficients; // Теперь ошибка должна исчезнуть
}
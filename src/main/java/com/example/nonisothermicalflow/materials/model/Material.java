package com.example.nonisothermicalflow.materials.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * Сущность, представляющая материал в системе.
 * Используется для хранения информации о различных материалах.
 */
@Entity
@Table(name = "materials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Material {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "ID_material")
    private UUID id;

    @NotBlank(message = "Название материала не может быть пустым")
    @Size(max = 255, message = "Название материала не должно превышать 255 символов")
    @Column(name = "name", nullable = false)
    private String name;

    @NotBlank(message = "Тип материала не может быть пустым")
    @Size(max = 255, message = "Тип материала не должен превышать 255 символов")
    @Column(name = "material_type", nullable = false)
    private String materialType;

    @OneToMany(mappedBy = "material", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<MaterialPropertyValue> propertyValues = new HashSet<>();

    @OneToMany(mappedBy = "material", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<MaterialCoefficientValue> coefficientValues = new HashSet<>();
}

package com.example.nonisothermicalflow.materials.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

/**
 * Сущность, представляющая свойство материала.
 * Используется для хранения различных физических свойств материалов.
 */
@Entity
@Table(name = "material_properties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MaterialProperty {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "ID_property")
    private UUID id;

    @NotBlank(message = "Название свойства не может быть пустым")
    @Size(max = 255, message = "Название свойства не должно превышать 255 символов")
    @Column(name = "property_name", nullable = false)
    private String propertyName;

    @NotBlank(message = "Единица измерения не может быть пустой")
    @Size(max = 50, message = "Единица измерения не должна превышать 50 символов")
    @Column(name = "unit_of_measurement", nullable = false)
    private String unitOfMeasurement;
}

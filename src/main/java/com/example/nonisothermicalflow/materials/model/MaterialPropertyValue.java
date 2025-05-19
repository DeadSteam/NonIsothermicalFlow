package com.example.nonisothermicalflow.materials.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

/**
 * Сущность, представляющая связь между материалом и его свойством.
 * Хранит значение свойства для конкретного материала.
 */
@Entity
@Table(name = "material_property")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MaterialPropertyValue {
    
    @EmbeddedId
    private MaterialPropertyValueId id;

    @ManyToOne
    @MapsId("materialId")
    @JoinColumn(name = "ID_material")
    @JsonBackReference
    private Material material;

    @ManyToOne
    @MapsId("propertyId")
    @JoinColumn(name = "ID_property")
    private MaterialProperty property;

    @NotNull(message = "Значение свойства не может быть пустым")
    @Column(name = "property_value", nullable = false)
    private Double propertyValue;
    
    /**
     * Создает новый объект MaterialPropertyValue и инициализирует составной ключ
     * @param material материал
     * @param property свойство
     * @param propertyValue значение свойства
     */
    public MaterialPropertyValue(Material material, MaterialProperty property, Double propertyValue) {
        this.material = material;
        this.property = property;
        this.propertyValue = propertyValue;
        this.id = new MaterialPropertyValueId(material.getId(), property.getId());
    }
}

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
class MaterialPropertyValueId {
    private UUID materialId;
    private UUID propertyId;
} 
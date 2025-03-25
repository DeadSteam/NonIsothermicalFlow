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
 * Сущность, представляющая эмпирический коэффициент.
 * Используется для хранения различных эмпирических коэффициентов материалов.
 */
@Entity
@Table(name = "empirical_coefficients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmpiricalCoefficient {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "ID_coefficient")
    private UUID id;

    @NotBlank(message = "Название коэффициента не может быть пустым")
    @Size(max = 255, message = "Название коэффициента не должно превышать 255 символов")
    @Column(name = "coefficient_name", nullable = false)
    private String coefficientName;

    @NotBlank(message = "Единица измерения не может быть пустой")
    @Size(max = 50, message = "Единица измерения не должна превышать 50 символов")
    @Column(name = "unit_of_measurement", nullable = false)
    private String unitOfMeasurement;
}

package com.example.nonisothermicalflow.math.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Модель для хранения результатов расчета неизотермического течения
 */
@Getter
@AllArgsConstructor
public class ResultModel {
    private final double shapeFactor;           // F
    private final double volumetricFlowRate;    // QCH, м³/с
    private final double shearRate;             // γ, 1/с
    private final double viscousHeat;           // qγ, Вт/м
    private final double heatFlux;              // qα, Вт/м
    private final int stepsCount;               // N

    private final List<Double> positions;       // z, м
    private final List<Double> temperatures;    // T, °C
    private final List<Double> viscosities;     // η, Па·с

    private final double productivity;         // Q, кг/ч
    private final double finalTemperature;     // Tp, °C
    private final double finalViscosity;       // ηp, Па·с
}

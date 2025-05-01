package com.example.nonisothermicalflow.math.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.util.List;

/**
 * Модель для хранения результатов расчета неизотермического течения
 */
@Getter
@AllArgsConstructor
public class ResultModel {
    private final List<Double> positions;       // z, м
    private final List<Double> temperatures;    // T, °C
    private final List<Double> viscosities;     // η, Па·с

    private final double productivity;         // Q, кг/ч
    private final double finalTemperature;     // Tp, °C
    private final double finalViscosity;
           // ηp, Па·с
    private final long calculationTime;        // Время расчета, мс
    private final long operationsCount;        // Количество математических операций
    private final long memoryUsage;            // Использованная память, байт
}
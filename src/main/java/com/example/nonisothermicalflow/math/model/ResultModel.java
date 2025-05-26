package com.example.nonisothermicalflow.math.model;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Getter;
import java.util.List;

/**
 * Модель для хранения результатов расчета неизотермического течения
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ResultModel {
    private List<Double> positions;       // z, м
    private List<Double> temperatures;    // T, °C
    private List<Double> viscosities;     // η, Па·с

    private double productivity;         // Q, кг/ч
    private double finalTemperature;     // Tp, °C
    private double finalViscosity;       // ηp, Па·с
    private long calculationTime;        // Время расчета, мс
    private long operationsCount;        // Количество математических операций
    private long memoryUsage;            // Использованная память, байт
}
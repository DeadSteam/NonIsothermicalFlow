package com.example.nonisothermicalflow.math.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Модель данных для параметров неизотермического течения
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MathModel {
    // Геометрические параметры канала
    private double width;                       // Ширина канала (W), м
    private double depth;                       // Глубина канала (H), м
    private double length;                      // Длина канала (L), м

    // Параметры свойств материала
    private double density;                      // Плотность (ρ), кг/м³
    private double heatCapacity;                 // Удельная теплоемкость (c), Дж/(кг·°C)
    private double glassTransitionTemp;          // Температура стеклования (Tg), °С
    private double meltingTemp;                  // Температура плавления (T0), °C

    // Режимные параметры процесса
    private double coverSpeed;                   // Скорость крышки (Vu), м/с
    private double coverTemp;                    // Температура крышки (Tu), °C

    // Эмпирические коэффициенты
    private double mu0;                          // Коэффициент консистенции (μ0), Па·с^n
    private double firstConstantVLF;             // Первая константа уравнения ВЛФ, C1,g
    private double secondConstantVLF;            // Вторая константа уравнения ВЛФ, C2,g , °С
    private double castingTemp;                  // Температура приведения (Tr), °C
    private double flowIndex;                    // Индекс течения (n)
    private double heatTransfer;                 // Коэффициент теплоотдачи (αu), Вт/(м²·°C)

    // Параметры метода решения
    private double step;                         // Шаг расчета (Δz), м
}
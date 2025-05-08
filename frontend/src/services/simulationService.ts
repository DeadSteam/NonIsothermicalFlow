import axios from 'axios';

const API_URL = 'http://localhost:8080/api/math/simulation';

export interface MathModel {
  width: number;                  // Ширина канала (W), м
  depth: number;                  // Глубина канала (H), м
  length: number;                 // Длина канала (L), м
  density: number;                // Плотность (ρ), кг/м³
  heatCapacity: number;           // Удельная теплоемкость (c), Дж/(кг·°C)
  glassTransitionTemp: number;    // Температура стеклования (Tg), °С
  meltingTemp: number;            // Температура плавления (T0), °C
  coverSpeed: number;             // Скорость крышки (Vu), м/с
  coverTemp: number;              // Температура крышки (Tu), °C
  mu0: number;                    // Коэффициент консистенции (μ0), Па·с^n
  firstConstantVLF: number;       // Первая константа уравнения ВЛФ, C1,g
  secondConstantVLF: number;      // Вторая константа уравнения ВЛФ, C2,g , °С
  castingTemp: number;            // Температура приведения (Tr), °C
  flowIndex: number;              // Индекс течения (n)
  heatTransfer: number;           // Коэффициент теплоотдачи (αu), Вт/(м²·°C)
  step: number;                   // Шаг расчета (Δz), м
  displayStep: number;            // Шаг отображения таблицы, м
}

export interface ResultModel {
  positions: number[];            // z, м
  temperatures: number[];         // T, °C
  viscosities: number[];          // η, Па·с
  productivity: number;           // Q, кг/ч
  finalTemperature: number;       // Tp, °C
  finalViscosity: number;         // ηp, Па·с
  calculationTime: number;        // Время расчета, мс
  operationsCount: number;        // Количество математических операций
  memoryUsage: number;            // Использованная память, байт
}

export const runSimulation = async (model: MathModel): Promise<ResultModel> => {
  try {
    const response = await axios.post<ResultModel>(API_URL, model);
    return response.data;
  } catch (error) {
    console.error('Ошибка при выполнении моделирования:', error);
    throw error;
  }
}; 
import axios from 'axios';
import { getApiUrl } from '../config/api.config';

// Создаю axios-инстанс с авторизацией
const simulationApi = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляю интерцептор для авторизованных запросов
simulationApi.interceptors.request.use((config) => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  }
  return config;
});

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
    const response = await simulationApi.post<ResultModel>(getApiUrl('/math/simulation'), model);
    return response.data;
  } catch (error) {
    console.error('Ошибка при выполнении моделирования:', error);
    throw error;
  }
}; 
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/math/simulation';

export interface MathModel {
  // Геометрические параметры
  width: number;          // Ширина канала (м)
  depth: number;          // Глубина канала (м)
  length: number;         // Длина канала (м)
  
  // Свойства материала
  density: number;        // Плотность (кг/м³)
  heatCapacity: number;   // Теплоёмкость (Дж/(кг·°C))
  glassTransitionTemp: number; // Температура стеклования (°C)
  meltingTemp: number;    // Температура плавления (°C)
  
  // Варьируемые параметры процесса
  coverSpeed: number;     // Скорость движения крышки (м/с)
  coverTemp: number;      // Температура крышки (°C)
  castingTemp: number;    // Температура литья (°C)
  
  // Эмпирические коэффициенты
  mu0: number;           // Начальная вязкость (Па·с)
  firstConstantVLF: number; // Первая константа ВЛФ
  secondConstantVLF: number; // Вторая константа ВЛФ
  flowIndex: number;     // Индекс течения
  heatTransfer: number;  // Коэффициент теплоотдачи (Вт/(м²·°C))
  
  // Параметры метода решения
  step: number;          // Шаг сетки (м)
  displayStep: number;   // Количество пропусков шагов при выводе в таблицу
}

export interface ResultModel {
  // Показатели экономичности
  calculationTime: number;  // Время расчёта (с)
  memoryUsage: number;     // Использовано памяти (байты)
  operationsCount: number;  // Количество операций
  
  // Результаты расчёта
  positions: number[];     // Координаты точек (м)
  temperatures: number[];  // Температура в точках (°C)
  viscosities: number[];  // Вязкость в точках (Па·с)
  velocities: number[];   // Скорость в точках (м/с)
  pressures: number[];    // Давление в точках (Па)
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
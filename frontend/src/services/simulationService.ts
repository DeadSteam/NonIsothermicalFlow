import axios from 'axios';
import { API_CONFIG } from '../config/api.config';

export interface SimulationModel {
  materialId: string;
  temperature: number;
  pressure: number;
  flowRate: number;
  time: number;
}

export interface SimulationResult {
  id: string;
  materialId: string;
  temperature: number[];
  pressure: number[];
  velocity: number[];
  timestamps: number[];
  createdAt: string;
}

// Создаю axios-инстанс с авторизацией
const simulationApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
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

// Обработка ошибок
simulationApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Произошла ошибка при выполнении запроса');
    }
    throw new Error('Сервер недоступен. Пожалуйста, попробуйте позже.');
  }
);

export const simulationService = {
  runSimulation: async (model: SimulationModel): Promise<SimulationResult> => {
    const response = await simulationApi.post('/math/simulation', model);
    return response.data;
  },

  getSimulationResults: async (simulationId: string): Promise<SimulationResult> => {
    const response = await simulationApi.get(`/math/simulation/${simulationId}`);
    return response.data;
  },

  getAllSimulationResults: async (): Promise<SimulationResult[]> => {
    const response = await simulationApi.get('/math/simulations');
    return response.data;
  },

  deleteSimulationResult: async (simulationId: string): Promise<void> => {
    await simulationApi.delete(`/math/simulation/${simulationId}`);
  }
};

export default simulationService; 
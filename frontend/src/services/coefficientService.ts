import axios from 'axios';
import { API_CONFIG } from '../config/api.config';
import { EmpiricalCoefficient as EmpiricalCoefficientType } from '../types/material.types';

export type EmpiricalCoefficient = EmpiricalCoefficientType;

// Создаю экземпляр axios с авторизацией
const coefficientApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляю интерцептор для авторизованных запросов
coefficientApi.interceptors.request.use((config) => {
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
coefficientApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Произошла ошибка при выполнении запроса');
    }
    throw new Error('Сервер недоступен. Пожалуйста, попробуйте позже.');
  }
);

export const coefficientService = {
  getAllCoefficients: async (): Promise<EmpiricalCoefficient[]> => {
    const response = await coefficientApi.get('/empirical-coefficients');
    return response.data;
  },

  getCoefficientById: async (id: string): Promise<EmpiricalCoefficient> => {
    const response = await coefficientApi.get(`/empirical-coefficients/${id}`);
    return response.data;
  },

  createCoefficient: async (coefficient: Omit<EmpiricalCoefficient, 'id'>): Promise<EmpiricalCoefficient> => {
    const response = await coefficientApi.post('/empirical-coefficients', coefficient);
    return response.data;
  },

  updateCoefficient: async (id: string, coefficient: Partial<EmpiricalCoefficient>): Promise<EmpiricalCoefficient> => {
    const response = await coefficientApi.put(`/empirical-coefficients/${id}`, coefficient);
    return response.data;
  },

  deleteCoefficient: async (id: string): Promise<void> => {
    await coefficientApi.delete(`/empirical-coefficients/${id}`);
  }
};

export default coefficientService; 
import axios from 'axios';
import { getApiUrl } from '../config/api.config';
import { EmpiricalCoefficient as EmpiricalCoefficientType } from '../types/material.types';

export type EmpiricalCoefficient = EmpiricalCoefficientType;

// Создаю экземпляр axios с авторизацией
const coefficientApi = axios.create({
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

export const getAllCoefficients = async (): Promise<EmpiricalCoefficient[]> => {
  const response = await coefficientApi.get(getApiUrl('/empirical-coefficients'));
  return response.data;
};

export const getCoefficientById = async (id: string): Promise<EmpiricalCoefficient> => {
  const response = await coefficientApi.get(getApiUrl(`/empirical-coefficients/${id}`));
  return response.data;
};

export const createCoefficient = async (coefficient: Omit<EmpiricalCoefficient, 'id'>): Promise<EmpiricalCoefficient> => {
  const response = await coefficientApi.post(getApiUrl('/empirical-coefficients'), coefficient);
  return response.data;
};

export const updateCoefficient = async (id: string, coefficient: Partial<EmpiricalCoefficient>): Promise<EmpiricalCoefficient> => {
  const response = await coefficientApi.put(getApiUrl(`/empirical-coefficients/${id}`), coefficient);
  return response.data;
};

export const deleteCoefficient = async (id: string): Promise<void> => {
  await coefficientApi.delete(getApiUrl(`/empirical-coefficients/${id}`));
}; 
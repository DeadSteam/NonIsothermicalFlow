import axios from 'axios';
import { API_CONFIG } from '../config/api.config';
import { Material as MaterialType, MaterialPropertyValue, MaterialCoefficientValue } from '../types/material.types';

export type Material = MaterialType;

// Создаю axios-инстанс с авторизацией
const materialApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляю интерцептор для авторизованных запросов
materialApi.interceptors.request.use((config) => {
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
materialApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Произошла ошибка при выполнении запроса');
    }
    throw new Error('Сервер недоступен. Пожалуйста, попробуйте позже.');
  }
);

export const materialService = {
  getAllMaterials: async (): Promise<Material[]> => {
    const response = await materialApi.get('/materials');
    return response.data;
  },

  getMaterialById: async (id: string): Promise<Material> => {
    const response = await materialApi.get(`/materials/${id}`);
    return response.data;
  },

  createMaterial: async (material: Omit<Material, 'id'>): Promise<Material> => {
    const response = await materialApi.post('/materials', material);
    return response.data;
  },

  updateMaterial: async (id: string, material: Partial<Material>): Promise<Material> => {
    const response = await materialApi.put(`/materials/${id}`, material);
    return response.data;
  },

  deleteMaterial: async (id: string): Promise<void> => {
    await materialApi.delete(`/materials/${id}`);
  },

  // Методы для работы со свойствами материала
  getMaterialProperties: async (materialId: string): Promise<MaterialPropertyValue[]> => {
    const response = await materialApi.get(`/material-properties/material/${materialId}`);
    return response.data;
  },

  updateMaterialProperty: async (
    materialId: string,
    propertyId: string,
    value: number
  ): Promise<MaterialPropertyValue> => {
    const response = await materialApi.put(`/material-properties/material/${materialId}/property/${propertyId}`, {
      value
    });
    return response.data;
  },

  // Методы для работы с коэффициентами материала
  getMaterialCoefficients: async (materialId: string): Promise<MaterialCoefficientValue[]> => {
    const response = await materialApi.get(`/material-coefficient-values/material/${materialId}`);
    return response.data;
  },

  updateMaterialCoefficient: async (
    materialId: string,
    coefficientId: string,
    value: number
  ): Promise<MaterialCoefficientValue> => {
    const response = await materialApi.put(
      `/material-coefficient-values/material/${materialId}/coefficient/${coefficientId}`,
      { value }
    );
    return response.data;
  }
};

export default materialService; 
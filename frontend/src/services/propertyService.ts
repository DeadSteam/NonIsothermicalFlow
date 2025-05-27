import axios from 'axios';
import { API_CONFIG } from '../config/api.config';

export interface MaterialProperty {
  id: string;
  propertyName: string;
  unitOfMeasurement: string;
  description: string;
}

// Создаю экземпляр axios с авторизацией
const propertyApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляю интерцептор для авторизованных запросов
propertyApi.interceptors.request.use((config) => {
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
propertyApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Произошла ошибка при выполнении запроса');
    }
    throw new Error('Сервер недоступен. Пожалуйста, попробуйте позже.');
  }
);

export const propertyService = {
  getAllProperties: async (): Promise<MaterialProperty[]> => {
    const response = await propertyApi.get('/material-properties');
    return response.data;
  },

  getPropertyById: async (id: string): Promise<MaterialProperty> => {
    const response = await propertyApi.get(`/material-properties/${id}`);
    return response.data;
  },

  createProperty: async (property: Omit<MaterialProperty, 'id'>): Promise<MaterialProperty> => {
    const response = await propertyApi.post('/material-properties', property);
    return response.data;
  },

  updateProperty: async (id: string, property: Partial<MaterialProperty>): Promise<MaterialProperty> => {
    const response = await propertyApi.put(`/material-properties/${id}`, property);
    return response.data;
  },

  deleteProperty: async (id: string): Promise<void> => {
    await propertyApi.delete(`/material-properties/${id}`);
  }
};

export default propertyService; 
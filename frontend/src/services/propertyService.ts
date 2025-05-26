import axios from 'axios';
import { getApiUrl } from '../config/api.config';

export interface MaterialProperty {
  id: string;
  propertyName: string;
  unitOfMeasurement: string;
  description: string;
}

// Создаю экземпляр axios с авторизацией
const propertyApi = axios.create({
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

export const getAllProperties = async (): Promise<MaterialProperty[]> => {
  const response = await propertyApi.get(getApiUrl('/material-properties'));
  return response.data;
};

export const getPropertyById = async (id: string): Promise<MaterialProperty> => {
  const response = await propertyApi.get(getApiUrl(`/material-properties/${id}`));
  return response.data;
};

export const createProperty = async (property: Omit<MaterialProperty, 'id'>): Promise<MaterialProperty> => {
  const response = await propertyApi.post(getApiUrl('/material-properties'), property);
  return response.data;
};

export const updateProperty = async (id: string, property: Partial<MaterialProperty>): Promise<MaterialProperty> => {
  const response = await propertyApi.put(getApiUrl(`/material-properties/${id}`), property);
  return response.data;
};

export const deleteProperty = async (id: string): Promise<void> => {
  await propertyApi.delete(getApiUrl(`/material-properties/${id}`));
}; 
import axios from 'axios';
import { getApiUrl } from '../config/api.config';
import { Material as MaterialType, MaterialPropertyValue, MaterialCoefficientValue, MaterialProperty, EmpiricalCoefficient } from '../types/material.types';
import { getAllProperties } from '../services/propertyService';
import { getAllCoefficients } from '../services/coefficientService';

export type Material = MaterialType;
export type { MaterialPropertyValue, MaterialCoefficientValue };

// Создаю axios-инстанс с авторизацией
const materialApi = axios.create({
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

export const getAllMaterials = async (): Promise<Material[]> => {
  const response = await materialApi.get(getApiUrl('/materials'));
  return response.data;
};

export const getMaterialById = async (id: string): Promise<Material> => {
  const response = await materialApi.get(getApiUrl(`/materials/${id}`));
  return response.data;
};

export const createMaterial = async (material: Omit<Material, 'id'>): Promise<Material> => {
  const response = await materialApi.post(getApiUrl('/materials'), material);
  return response.data;
};

export const updateMaterial = async (id: string, material: Partial<Material>): Promise<Material> => {
  try {
    console.log(`Обновление материала: id=${id}`);
    console.log('Данные для обновления:', material);
    
    const response = await materialApi.put(getApiUrl(`/materials/${id}`), material);
    console.log('Ответ от сервера:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Ошибка при обновлении материала:', error);
    throw error;
  }
};

export const deleteMaterial = async (id: string): Promise<void> => {
  await materialApi.delete(getApiUrl(`/materials/${id}`));
};

// Получение свойств материала
export const getMaterialProperties = async (materialId: string): Promise<MaterialPropertyValue[]> => {
  const response = await materialApi.get(getApiUrl(`/material-properties/material/${materialId}`));
  return response.data;
};

// Добавление свойства материала
export const addMaterialProperty = async (
  materialId: string,
  propertyId: string,
  value: number
): Promise<MaterialPropertyValue> => {
  try {
    console.log(`Добавление свойства материала: materialId=${materialId}, propertyId=${propertyId}, value=${value}`);
    
    const response = await materialApi.post(getApiUrl(`/material-properties/material/${materialId}/property/${propertyId}`), {
      value: value
    });
    
    console.log('Ответ сервера при добавлении свойства:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ошибка при добавлении свойства материала:', error);
    throw error;
  }
};

// Обновление свойства материала
export const updateMaterialProperty = async (
  materialId: string,
  propertyId: string,
  value: number
): Promise<MaterialPropertyValue> => {
  try {
    console.log(`Обновление свойства материала: materialId=${materialId}, propertyId=${propertyId}, value=${value}`);
    
    const response = await materialApi.put(getApiUrl(`/material-properties/material/${materialId}/property/${propertyId}`), {
      value: value
    });
    
    console.log('Ответ сервера при обновлении свойства:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ошибка при обновлении свойства материала:', error);
    throw error;
  }
};

// Удаление свойства материала
export const deleteMaterialProperty = async (
  materialId: string,
  propertyId: string
): Promise<void> => {
  try {
    console.log(`Удаление свойства материала: materialId=${materialId}, propertyId=${propertyId}`);
    
    const response = await materialApi.delete(getApiUrl(`/material-properties/material/${materialId}/property/${propertyId}`));
    console.log('Ответ сервера при удалении свойства:', response);
  } catch (error) {
    console.error('Ошибка при удалении свойства материала:', error);
    throw error;
  }
};

// Получение коэффициентов материала
export const getMaterialCoefficients = async (materialId: string): Promise<MaterialCoefficientValue[]> => {
  const response = await materialApi.get(getApiUrl(`/material-coefficient-values/material/${materialId}`));
  return response.data;
};

// Добавление коэффициента материала
export const addMaterialCoefficient = async (
  materialId: string,
  coefficientId: string,
  value: number
): Promise<MaterialCoefficientValue> => {
  try {
    console.log(`Добавление коэффициента материала: materialId=${materialId}, coefficientId=${coefficientId}, value=${value}`);
    
    const response = await materialApi.post(getApiUrl(`/material-coefficient-values/material/${materialId}/coefficient/${coefficientId}`), {
      value: value
    });
    
    console.log('Ответ сервера при добавлении коэффициента:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ошибка при добавлении коэффициента материала:', error);
    throw error;
  }
};

// Обновление коэффициента материала
export const updateMaterialCoefficient = async (
  materialId: string,
  coefficientId: string,
  value: number
): Promise<MaterialCoefficientValue> => {
  try {
    console.log(`Обновление коэффициента материала: materialId=${materialId}, coefficientId=${coefficientId}, value=${value}`);
    
    const response = await materialApi.put(getApiUrl(`/material-coefficient-values/material/${materialId}/coefficient/${coefficientId}`), {
      value: value
    });
    
    console.log('Ответ сервера при обновлении коэффициента:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ошибка при обновлении коэффициента материала:', error);
    throw error;
  }
};

// Удаление коэффициента материала
export const deleteMaterialCoefficient = async (
  materialId: string,
  coefficientId: string
): Promise<void> => {
  try {
    console.log(`Удаление коэффициента материала: materialId=${materialId}, coefficientId=${coefficientId}`);
    
    const response = await materialApi.delete(getApiUrl(`/material-coefficient-values/material/${materialId}/coefficient/${coefficientId}`));
    console.log('Ответ сервера при удалении коэффициента:', response);
  } catch (error) {
    console.error('Ошибка при удалении коэффициента материала:', error);
    throw error;
  }
}; 
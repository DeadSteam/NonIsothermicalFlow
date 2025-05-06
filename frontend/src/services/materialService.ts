import axios from 'axios';
import { getApiUrl } from '../config/api.config';
import { Material as MaterialType, MaterialPropertyValue, MaterialCoefficientValue } from '../types/material.types';

export type Material = MaterialType;
export type { MaterialPropertyValue, MaterialCoefficientValue };

export const getAllMaterials = async (): Promise<Material[]> => {
  const response = await axios.get(getApiUrl('/materials'));
  return response.data;
};

export const getMaterialById = async (id: string): Promise<Material> => {
  const response = await axios.get(getApiUrl(`/materials/${id}`));
  return response.data;
};

export const createMaterial = async (material: Omit<Material, 'id'>): Promise<Material> => {
  const response = await axios.post(getApiUrl('/materials'), material);
  return response.data;
};

export const updateMaterial = async (id: string, material: Partial<Material>): Promise<Material> => {
  const response = await axios.put(getApiUrl(`/materials/${id}`), material);
  return response.data;
};

export const deleteMaterial = async (id: string): Promise<void> => {
  await axios.delete(getApiUrl(`/materials/${id}`));
};

export const getMaterialProperties = async (materialId: string): Promise<MaterialPropertyValue[]> => {
  const response = await axios.get(getApiUrl(`/material-properties/material/${materialId}`));
  return response.data;
};

export const addMaterialProperty = async (
  materialId: string,
  propertyId: string,
  value: number
): Promise<MaterialPropertyValue> => {
  const response = await axios.post(getApiUrl(`/material-properties/material/${materialId}/property/${propertyId}`), {
    propertyValue: value
  });
  return response.data;
};

export const updateMaterialProperty = async (
  materialId: string,
  propertyId: string,
  value: number
): Promise<MaterialPropertyValue> => {
  const response = await axios.put(getApiUrl(`/material-properties/material/${materialId}/property/${propertyId}`), {
    propertyValue: value
  });
  return response.data;
};

export const getMaterialCoefficients = async (materialId: string): Promise<MaterialCoefficientValue[]> => {
  const response = await axios.get(getApiUrl(`/material-coefficients/material/${materialId}`));
  return response.data;
};

export const addMaterialCoefficient = async (
  materialId: string,
  coefficientId: string,
  value: number
): Promise<MaterialCoefficientValue> => {
  const response = await axios.post(getApiUrl(`/material-coefficients/material/${materialId}/coefficient/${coefficientId}`), {
    coefficientValue: value
  });
  return response.data;
};

export const updateMaterialCoefficient = async (
  materialId: string,
  coefficientId: string,
  value: number
): Promise<MaterialCoefficientValue> => {
  const response = await axios.put(getApiUrl(`/material-coefficients/material/${materialId}/coefficient/${coefficientId}`), {
    coefficientValue: value
  });
  return response.data;
}; 
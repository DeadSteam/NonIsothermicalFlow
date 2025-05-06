import axios from 'axios';
import { getApiUrl } from '../config/api.config';

export interface MaterialProperty {
  id: string;
  propertyName: string;
  unitOfMeasurement: string;
  description: string;
}

export const getAllProperties = async (): Promise<MaterialProperty[]> => {
  const response = await axios.get(getApiUrl('/properties'));
  return response.data;
};

export const getPropertyById = async (id: string): Promise<MaterialProperty> => {
  const response = await axios.get(getApiUrl(`/properties/${id}`));
  return response.data;
};

export const createProperty = async (property: Omit<MaterialProperty, 'id'>): Promise<MaterialProperty> => {
  const response = await axios.post(getApiUrl('/properties'), property);
  return response.data;
};

export const updateProperty = async (id: string, property: Partial<MaterialProperty>): Promise<MaterialProperty> => {
  const response = await axios.put(getApiUrl(`/properties/${id}`), property);
  return response.data;
};

export const deleteProperty = async (id: string): Promise<void> => {
  await axios.delete(getApiUrl(`/properties/${id}`));
}; 
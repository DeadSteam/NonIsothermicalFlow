import axios from 'axios';
import { getApiUrl } from '../config/api.config';

export interface MathModel {
  id: string;
  consistencyCoefficient: number;
  tempViscosityCoefficient: number;
  castingTemperature: number;
  flowIndex: number;
  coverHeatTransferCoefficient: number;
  materialId: string;
  materialName: string;
}

export const getAllMathModels = async (): Promise<MathModel[]> => {
  const response = await axios.get(getApiUrl('/math-models'));
  return response.data;
};

export const getMathModelById = async (id: string): Promise<MathModel> => {
  const response = await axios.get(getApiUrl(`/math-models/${id}`));
  return response.data;
};

export const createMathModel = async (mathModel: Omit<MathModel, 'id' | 'materialName'>): Promise<MathModel> => {
  const response = await axios.post(getApiUrl('/math-models'), mathModel);
  return response.data;
};

export const updateMathModel = async (id: string, mathModel: Partial<Omit<MathModel, 'id' | 'materialName'>>): Promise<MathModel> => {
  const response = await axios.put(getApiUrl(`/math-models/${id}`), mathModel);
  return response.data;
};

export const deleteMathModel = async (id: string): Promise<void> => {
  await axios.delete(getApiUrl(`/math-models/${id}`));
}; 
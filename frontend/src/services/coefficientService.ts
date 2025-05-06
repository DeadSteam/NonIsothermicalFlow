import axios from 'axios';
import { getApiUrl } from '../config/api.config';
import { EmpiricalCoefficient as EmpiricalCoefficientType } from '../types/material.types';

export type EmpiricalCoefficient = EmpiricalCoefficientType;

export const getAllCoefficients = async (): Promise<EmpiricalCoefficient[]> => {
  const response = await axios.get(getApiUrl('/coefficients'));
  return response.data;
};

export const getCoefficientById = async (id: string): Promise<EmpiricalCoefficient> => {
  const response = await axios.get(getApiUrl(`/coefficients/${id}`));
  return response.data;
};

export const createCoefficient = async (coefficient: Omit<EmpiricalCoefficient, 'id'>): Promise<EmpiricalCoefficient> => {
  const response = await axios.post(getApiUrl('/coefficients'), coefficient);
  return response.data;
};

export const updateCoefficient = async (id: string, coefficient: Partial<EmpiricalCoefficient>): Promise<EmpiricalCoefficient> => {
  const response = await axios.put(getApiUrl(`/coefficients/${id}`), coefficient);
  return response.data;
};

export const deleteCoefficient = async (id: string): Promise<void> => {
  await axios.delete(getApiUrl(`/coefficients/${id}`));
}; 
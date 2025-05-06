import axios from 'axios';
import { getApiUrl } from '../config/api.config';

export interface ProcessParams {
  id: string;
  coverSpeed: number;
  coverTemperature: number;
}

export const getAllProcessParams = async (): Promise<ProcessParams[]> => {
  const response = await axios.get(getApiUrl('/process-params'));
  return response.data;
};

export const getProcessParamsById = async (id: string): Promise<ProcessParams> => {
  const response = await axios.get(getApiUrl(`/process-params/${id}`));
  return response.data;
};

export const createProcessParams = async (params: Omit<ProcessParams, 'id'>): Promise<ProcessParams> => {
  const response = await axios.post(getApiUrl('/process-params'), params);
  return response.data;
};

export const updateProcessParams = async (id: string, params: Partial<ProcessParams>): Promise<ProcessParams> => {
  const response = await axios.put(getApiUrl(`/process-params/${id}`), params);
  return response.data;
};

export const deleteProcessParams = async (id: string): Promise<void> => {
  await axios.delete(getApiUrl(`/process-params/${id}`));
}; 
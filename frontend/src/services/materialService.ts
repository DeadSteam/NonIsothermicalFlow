import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1/materials';

export interface MaterialProperty {
  id: string;
  propertyName: string;
  unitOfMeasurement: string;
}

export interface MaterialPropertyValue {
  property: MaterialProperty;
  propertyValue: number;
}

export interface MaterialCoefficientValue {
  coefficient: {
    id: string;
    coefficientName: string;
    unitOfMeasurement: string;
  };
  coefficientValue: number;
}

export interface Material {
  id: string;
  name: string;
  materialType: string;
  propertyValues: MaterialPropertyValue[];
  coefficientValues: MaterialCoefficientValue[];
}

export const getAllMaterials = async (): Promise<Material[]> => {
  try {
    const response = await axios.get<Material[]>(API_URL);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении списка материалов:', error);
    throw error;
  }
};

export const getMaterialById = async (id: string): Promise<Material> => {
  try {
    const response = await axios.get<Material>(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении материала с ID ${id}:`, error);
    throw error;
  }
}; 
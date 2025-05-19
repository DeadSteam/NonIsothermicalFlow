export interface Material {
  id: string;
  name: string;
  materialType: string;
  propertyValues: MaterialPropertyValue[];
  coefficientValues: MaterialCoefficientValue[];
}

export interface MaterialProperty {
  id: string;
  propertyName: string;
  unitOfMeasurement: string;
  description?: string;
}

export interface EmpiricalCoefficient {
  id: string;
  coefficientName: string;
  unitOfMeasurement: string;
  description?: string;
}

export interface MaterialPropertyValueId {
  materialId: string;
  propertyId: string;
}

export interface MaterialCoefficientValueId {
  materialId: string;
  coefficientId: string;
}

export interface MaterialPropertyValue {
  id?: MaterialPropertyValueId;
  property: MaterialProperty;
  propertyValue: number;
  material?: Partial<Material>;
}

export interface MaterialCoefficientValue {
  id?: MaterialCoefficientValueId;
  coefficient: EmpiricalCoefficient;
  coefficientValue: number;
  material?: Partial<Material>;
}

export interface MaterialFormData {
  id: string | null;
  name: string;
  materialType: string;
  propertyValues: MaterialPropertyValue[];
  coefficientValues: MaterialCoefficientValue[];
}

export interface PropertyFormData {
  id: string | null;
  propertyName: string;
  unitOfMeasurement: string;
  description?: string;
}

export interface CoefficientFormData {
  id: string | null;
  coefficientName: string;
  unitOfMeasurement: string;
  description?: string;
} 
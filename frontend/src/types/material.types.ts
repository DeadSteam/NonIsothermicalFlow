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

export interface MaterialPropertyValue {
  property: MaterialProperty;
  propertyValue: number;
}

export interface MaterialCoefficientValue {
  coefficient: EmpiricalCoefficient;
  coefficientValue: number;
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
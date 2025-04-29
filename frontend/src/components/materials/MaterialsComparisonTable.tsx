import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  Material,
  MaterialProperty,
  MaterialPropertyValue,
  MaterialCoefficientValue,
  getAllMaterials
} from '../../services/materialService';

const MaterialsComparisonTable: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка списка материалов при монтировании компонента
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        const data = await getAllMaterials();
        setMaterials(data);
        setError(null);
      } catch (err) {
        setError('Ошибка при загрузке списка материалов');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  // Получаем все уникальные свойства из всех материалов
  const getAllUniqueProperties = (): MaterialProperty[] => {
    const uniquePropertiesMap = new Map<string, MaterialProperty>();
    
    materials.forEach(material => {
      if (material.propertyValues) {
        material.propertyValues.forEach(pv => {
          if (!uniquePropertiesMap.has(pv.property.id)) {
            uniquePropertiesMap.set(pv.property.id, pv.property);
          }
        });
      }
    });
    
    return Array.from(uniquePropertiesMap.values());
  };

  // Получаем все уникальные коэффициенты из всех материалов
  const getAllUniqueCoefficients = (): MaterialProperty[] => {
    const uniqueCoefficientsMap = new Map<string, MaterialProperty>();
    
    materials.forEach(material => {
      if (material.coefficientValues) {
        material.coefficientValues.forEach(cv => {
          if (!uniqueCoefficientsMap.has(cv.coefficient.id)) {
            uniqueCoefficientsMap.set(cv.coefficient.id, {
              id: cv.coefficient.id,
              propertyName: cv.coefficient.coefficientName,
              unitOfMeasurement: cv.coefficient.unitOfMeasurement
            });
          }
        });
      }
    });
    
    return Array.from(uniqueCoefficientsMap.values());
  };

  // Получаем значение свойства для конкретного материала
  const getPropertyValue = (material: Material, propertyId: string): number | null => {
    if (!material.propertyValues) return null;
    
    const propertyValue = material.propertyValues.find(pv => pv.property.id === propertyId);
    return propertyValue ? propertyValue.propertyValue : null;
  };

  // Получаем значение коэффициента для конкретного материала
  const getCoefficientValue = (material: Material, coefficientId: string): number | null => {
    if (!material.coefficientValues) return null;
    
    const coefficientValue = material.coefficientValues.find(cv => cv.coefficient.id === coefficientId);
    return coefficientValue ? coefficientValue.coefficientValue : null;
  };

  const uniqueProperties = getAllUniqueProperties();
  const uniqueCoefficients = getAllUniqueCoefficients();

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Сравнительная таблица материалов
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : materials && materials.length > 0 ? (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Свойства материалов
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Материал</TableCell>
                  {uniqueProperties.map(property => (
                    <TableCell key={property.id} align="right" sx={{ fontWeight: 'bold' }}>
                      {property.propertyName} ({property.unitOfMeasurement})
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {materials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell component="th" scope="row">
                      {material.name} ({material.materialType})
                    </TableCell>
                    {uniqueProperties.map(property => (
                      <TableCell key={`${material.id}-${property.id}`} align="right">
                        {getPropertyValue(material, property.id) !== null
                          ? getPropertyValue(material, property.id)
                          : '—'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Коэффициенты материалов
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Материал</TableCell>
                  {uniqueCoefficients.map(coefficient => (
                    <TableCell key={coefficient.id} align="right" sx={{ fontWeight: 'bold' }}>
                      {coefficient.propertyName} ({coefficient.unitOfMeasurement})
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {materials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell component="th" scope="row">
                      {material.name} ({material.materialType})
                    </TableCell>
                    {uniqueCoefficients.map(coefficient => (
                      <TableCell key={`${material.id}-${coefficient.id}`} align="right">
                        {getCoefficientValue(material, coefficient.id) !== null
                          ? getCoefficientValue(material, coefficient.id)
                          : '—'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : (
        <Alert severity="info" sx={{ my: 2 }}>Нет доступных материалов для сравнения</Alert>
      )}
    </Box>
  );
};

export default MaterialsComparisonTable; 
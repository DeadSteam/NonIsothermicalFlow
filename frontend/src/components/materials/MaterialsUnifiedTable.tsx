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
  getAllMaterials
} from '../../services/materialService';
import { MaterialProperty } from '../../services/propertyService';

interface ColumnDefinition {
  id: string;
  name: string;
  unit: string;
  type: 'property' | 'coefficient';
}

const MaterialsUnifiedTable: React.FC = () => {
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

  // Получаем все уникальные столбцы из свойств и коэффициентов
  const getAllColumns = (): ColumnDefinition[] => {
    const columnsMap = new Map<string, ColumnDefinition>();
    
    materials.forEach(material => {
      // Добавляем свойства
      if (material.propertyValues) {
        material.propertyValues.forEach(pv => {
          if (!columnsMap.has(pv.property.id)) {
            columnsMap.set(pv.property.id, {
              id: pv.property.id,
              name: pv.property.propertyName,
              unit: pv.property.unitOfMeasurement,
              type: 'property'
            });
          }
        });
      }
      
      // Добавляем коэффициенты
      if (material.coefficientValues) {
        material.coefficientValues.forEach(cv => {
          if (!columnsMap.has(cv.coefficient.id)) {
            columnsMap.set(cv.coefficient.id, {
              id: cv.coefficient.id,
              name: cv.coefficient.coefficientName,
              unit: cv.coefficient.unitOfMeasurement,
              type: 'coefficient'
            });
          }
        });
      }
    });
    
    return Array.from(columnsMap.values());
  };

  // Получаем значение для ячейки (свойство или коэффициент)
  const getCellValue = (material: Material, column: ColumnDefinition): number | null => {
    if (column.type === 'property') {
      if (!material.propertyValues) return null;
      const propertyValue = material.propertyValues.find(pv => pv.property.id === column.id);
      return propertyValue ? propertyValue.propertyValue : null;
    } else {
      if (!material.coefficientValues) return null;
      const coefficientValue = material.coefficientValues.find(cv => cv.coefficient.id === column.id);
      return coefficientValue ? coefficientValue.coefficientValue : null;
    }
  };

  const columns = getAllColumns();

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
        <TableContainer component={Paper} sx={{ mb: 4, overflow: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', position: 'sticky', left: 0, background: '#f5f5f5', zIndex: 1 }}>
                  Материал
                </TableCell>
                {columns.map(column => (
                  <TableCell 
                    key={column.id} 
                    align="right" 
                    sx={{ 
                      fontWeight: 'bold',
                      backgroundColor: column.type === 'property' ? '#e3f2fd' : '#fce4ec' 
                    }}
                  >
                    {column.name} ({column.unit})
                    <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem' }}>
                      {column.type === 'property' ? 'Свойство' : 'Коэффициент'}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {materials.map((material) => (
                <TableRow key={material.id} hover>
                  <TableCell 
                    component="th" 
                    scope="row" 
                    sx={{ position: 'sticky', left: 0, background: '#fff', zIndex: 1 }}
                  >
                    <strong>{material.name}</strong><br />
                    <Typography variant="caption">
                      {material.materialType}
                    </Typography>
                  </TableCell>
                  {columns.map(column => (
                    <TableCell 
                      key={`${material.id}-${column.id}`} 
                      align="right"
                      sx={{ 
                        backgroundColor: column.type === 'property' ? '#f5fbff' : '#fff9fb' 
                      }}
                    >
                      {getCellValue(material, column) !== null
                        ? getCellValue(material, column)
                        : '—'}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Alert severity="info" sx={{ my: 2 }}>Нет доступных материалов для сравнения</Alert>
      )}
    </Box>
  );
};

export default MaterialsUnifiedTable; 
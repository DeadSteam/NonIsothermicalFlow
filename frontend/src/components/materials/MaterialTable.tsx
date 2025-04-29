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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { 
  Material, 
  getAllMaterials, 
  getMaterialById
} from '../../services/materialService';
import {log} from "node:util";

const MaterialTable: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
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

  // Загрузка данных о выбранном материале
  const handleMaterialChange = async (event: SelectChangeEvent) => {
    const materialId = event.target.value;
    setSelectedMaterialId(materialId);

    if (!materialId) {
      setSelectedMaterial(null);
      return;
    }

    try {
      setLoading(true);
      const data = await getMaterialById(materialId);
      setSelectedMaterial(data);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке информации о материале');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Характеристики материала
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="material-select-label">Выберите материал</InputLabel>
        <Select
          labelId="material-select-label"
          id="material-select"
          value={selectedMaterialId}
          label="Выберите материал"
          onChange={handleMaterialChange}
          disabled={loading}
        >
          <MenuItem value="">
            <em>Не выбрано</em>
          </MenuItem>
          {materials && materials.map((material) => (
            <MenuItem key={material.id} value={material.id}>
              {material.name} ({material.materialType})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : selectedMaterial ? (
        <>
          <Typography variant="h6" gutterBottom>
            Свойства
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Свойство</TableCell>
                  <TableCell align="right">Значение</TableCell>
                  <TableCell>Единица измерения</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedMaterial.propertyValues && selectedMaterial.propertyValues.map((pv) => (
                  <TableRow key={pv.property.id}>
                    <TableCell>{pv.property.propertyName}</TableCell>
                    <TableCell align="right">{pv.propertyValue}</TableCell>
                    <TableCell>{pv.property.unitOfMeasurement}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h6" gutterBottom>
            Коэффициенты
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Коэффициент</TableCell>
                  <TableCell align="right">Значение</TableCell>
                  <TableCell>Единица измерения</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedMaterial.coefficientValues && selectedMaterial.coefficientValues.map((cv) => (
                  <TableRow key={cv.coefficient.id}>
                    <TableCell>{cv.coefficient.coefficientName}</TableCell>
                    <TableCell align="right">{cv.coefficientValue}</TableCell>
                    <TableCell>{cv.coefficient.unitOfMeasurement}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : null}
    </Box>
  );
};

export default MaterialTable; 
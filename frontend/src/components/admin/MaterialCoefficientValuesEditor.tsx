import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { 
  Material, 
  EmpiricalCoefficient, 
  MaterialCoefficientValue 
} from '../../types/material.types';
import { getAllCoefficients } from '../../services/coefficientService';
import { updateMaterial } from '../../services/materialService';

interface MaterialCoefficientValuesEditorProps {
  material: Material;
  onSave: (updatedMaterial: Material) => void;
}

const MaterialCoefficientValuesEditor: React.FC<MaterialCoefficientValuesEditorProps> = ({ material, onSave }) => {
  const [coefficients, setCoefficients] = useState<EmpiricalCoefficient[]>([]);
  const [coefficientValues, setCoefficientValues] = useState<MaterialCoefficientValue[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedCoefficient, setSelectedCoefficient] = useState<string>('');
  const [coefficientValue, setCoefficientValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCoefficients();
    setCoefficientValues(material.coefficientValues || []);
  }, [material]);

  const fetchCoefficients = async () => {
    try {
      setLoading(true);
      const data = await getAllCoefficients();
      setCoefficients(data);
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке коэффициентов:', err);
      setError('Ошибка при загрузке коэффициентов');
    } finally {
      setLoading(false);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
    setError(null);
    setSelectedCoefficient('');
    setCoefficientValue('');
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCoefficientChange = (e: SelectChangeEvent) => {
    setSelectedCoefficient(e.target.value);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCoefficientValue(e.target.value);
  };

  const validateForm = (): boolean => {
    if (!selectedCoefficient) {
      setError('Пожалуйста, выберите коэффициент');
      return false;
    }

    if (!coefficientValue.trim()) {
      setError('Пожалуйста, введите значение');
      return false;
    }

    // Проверяем, можно ли сконвертировать в число
    if (isNaN(Number(coefficientValue))) {
      setError('Значение должно быть числом');
      return false;
    }

    return true;
  };

  const handleAddCoefficientValue = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const selectedCoefficientObj = coefficients.find(c => c.id === selectedCoefficient);
      
      if (!selectedCoefficientObj) {
        setError('Выбранный коэффициент не найден');
        return;
      }

      // Проверяем, нет ли уже такого коэффициента
      const existingCoefficientIndex = coefficientValues.findIndex(
        cv => cv.coefficient.id === selectedCoefficient
      );

      const updatedCoefficientValues = [...coefficientValues];

      if (existingCoefficientIndex >= 0) {
        // Если коэффициент уже существует, обновляем его значение
        updatedCoefficientValues[existingCoefficientIndex] = {
          ...updatedCoefficientValues[existingCoefficientIndex],
          coefficientValue: Number(coefficientValue)
        };
      } else {
        // Иначе добавляем новый коэффициент
        updatedCoefficientValues.push({
          coefficient: selectedCoefficientObj,
          coefficientValue: Number(coefficientValue)
        });
      }

      setCoefficientValues(updatedCoefficientValues);

      // Обновляем материал
      const updatedMaterial = {
        ...material,
        coefficientValues: updatedCoefficientValues
      };

      await updateMaterial(material.id, updatedMaterial);
      onSave(updatedMaterial);

      handleClose();
    } catch (err) {
      console.error('Ошибка при сохранении значения коэффициента:', err);
      setError('Ошибка при сохранении значения коэффициента');
    }
  };

  const handleEditCoefficientValue = (coefficientValue: MaterialCoefficientValue) => {
    setSelectedCoefficient(coefficientValue.coefficient.id);
    setCoefficientValue(coefficientValue.coefficientValue.toString());
    setOpen(true);
  };

  const handleDeleteCoefficientValue = async (coefficientId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить это значение коэффициента?')) {
      return;
    }

    try {
      const updatedCoefficientValues = coefficientValues.filter(
        cv => cv.coefficient.id !== coefficientId
      );

      setCoefficientValues(updatedCoefficientValues);

      // Обновляем материал
      const updatedMaterial = {
        ...material,
        coefficientValues: updatedCoefficientValues
      };

      await updateMaterial(material.id, updatedMaterial);
      onSave(updatedMaterial);
    } catch (err) {
      console.error('Ошибка при удалении значения коэффициента:', err);
      setError('Ошибка при удалении значения коэффициента');
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Значения коэффициентов материала: {material.name}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Добавить значение
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Название коэффициента</TableCell>
                <TableCell>Значение</TableCell>
                <TableCell>Единица измерения</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {coefficientValues.map((cv) => (
                <TableRow key={cv.coefficient.id}>
                  <TableCell>{cv.coefficient.coefficientName}</TableCell>
                  <TableCell>{cv.coefficientValue}</TableCell>
                  <TableCell>{cv.coefficient.unitOfMeasurement}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEditCoefficientValue(cv)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteCoefficientValue(cv.coefficient.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {coefficientValues.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    У этого материала нет коэффициентов. Нажмите "Добавить значение", чтобы добавить коэффициент.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {selectedCoefficient && coefficients.find(c => c.id === selectedCoefficient) ? 
            'Редактировать значение коэффициента' : 'Добавить значение коэффициента'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            <InputLabel id="coefficient-select-label">Коэффициент</InputLabel>
            <Select
              labelId="coefficient-select-label"
              id="coefficient-select"
              value={selectedCoefficient}
              label="Коэффициент"
              onChange={handleCoefficientChange}
            >
              {coefficients.map((coefficient) => (
                <MenuItem key={coefficient.id} value={coefficient.id}>
                  {coefficient.coefficientName} ({coefficient.unitOfMeasurement})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="coefficientValue"
            label="Значение"
            type="number"
            fullWidth
            value={coefficientValue}
            onChange={handleValueChange}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button onClick={handleAddCoefficientValue} variant="contained">
            {selectedCoefficient && coefficients.find(c => c.id === selectedCoefficient) ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MaterialCoefficientValuesEditor; 
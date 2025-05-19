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
  MaterialProperty, 
  MaterialPropertyValue 
} from '../../types/material.types';
import { getAllProperties } from '../../services/propertyService';
import { 
  updateMaterial, 
  getMaterialProperties,
  addMaterialProperty,
  updateMaterialProperty,
  deleteMaterialProperty
} from '../../services/materialService';

interface MaterialPropertyValuesEditorProps {
  material: Material;
  onSave: (updatedMaterial: Material) => void;
}

const MaterialPropertyValuesEditor: React.FC<MaterialPropertyValuesEditorProps> = ({ material, onSave }) => {
  const [properties, setProperties] = useState<MaterialProperty[]>([]);
  const [propertyValues, setPropertyValues] = useState<MaterialPropertyValue[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [propertyValue, setPropertyValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProperties();
    setPropertyValues(material.propertyValues || []);
  }, [material]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const data = await getAllProperties();
      setProperties(data);
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке свойств:', err);
      setError('Ошибка при загрузке свойств');
    } finally {
      setLoading(false);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
    setError(null);
    setSelectedProperty('');
    setPropertyValue('');
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handlePropertyChange = (e: SelectChangeEvent) => {
    setSelectedProperty(e.target.value);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPropertyValue(e.target.value);
  };

  const validateForm = (): boolean => {
    if (!selectedProperty) {
      setError('Пожалуйста, выберите свойство');
      return false;
    }

    if (!propertyValue.trim()) {
      setError('Пожалуйста, введите значение');
      return false;
    }

    // Проверяем, можно ли сконвертировать в число
    if (isNaN(Number(propertyValue))) {
      setError('Значение должно быть числом');
      return false;
    }

    return true;
  };

  const handleAddPropertyValue = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const selectedPropertyObj = properties.find(p => p.id === selectedProperty);
      
      if (!selectedPropertyObj) {
        setError('Выбранное свойство не найдено');
        return;
      }

      // Проверяем, нет ли уже такого свойства
      const existingPropertyIndex = propertyValues.findIndex(
        pv => pv.property.id === selectedProperty
      );

      let updatedPropertyValue;
      
      if (existingPropertyIndex >= 0) {
        // Если свойство уже существует, обновляем его значение
        updatedPropertyValue = await updateMaterialProperty(
          material.id,
          selectedProperty,
          Number(propertyValue)
        );
        
        const updatedPropertyValues = [...propertyValues];
        updatedPropertyValues[existingPropertyIndex] = updatedPropertyValue;
        setPropertyValues(updatedPropertyValues);
      } else {
        // Иначе добавляем новое свойство
        updatedPropertyValue = await addMaterialProperty(
          material.id,
          selectedProperty,
          Number(propertyValue)
        );
        
        setPropertyValues([...propertyValues, updatedPropertyValue]);
      }

      // Обновляем материал в родительском компоненте
      const updatedMaterial = {
        ...material,
        propertyValues: await getMaterialProperties(material.id)
      };
      onSave(updatedMaterial);

      handleClose();
    } catch (err) {
      console.error('Ошибка при сохранении значения свойства:', err);
      setError('Ошибка при сохранении значения свойства');
    }
  };

  const handleEditPropertyValue = (propertyValue: MaterialPropertyValue) => {
    setSelectedProperty(propertyValue.property.id);
    setPropertyValue(propertyValue.propertyValue.toString());
    setOpen(true);
  };

  const handleDeletePropertyValue = async (propertyId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить это значение свойства?')) {
      return;
    }

    try {
      // Удаляем значение свойства через API
      await deleteMaterialProperty(material.id, propertyId);
      
      // Обновляем локальный список свойств
      const updatedPropertyValues = propertyValues.filter(
        pv => pv.property.id !== propertyId
      );
      setPropertyValues(updatedPropertyValues);

      // Обновляем материал в родительском компоненте
      const updatedMaterial = {
        ...material,
        propertyValues: updatedPropertyValues
      };
      onSave(updatedMaterial);
    } catch (err) {
      console.error('Ошибка при удалении значения свойства:', err);
      setError('Ошибка при удалении значения свойства');
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Значения свойств материала: {material.name}</Typography>
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
                <TableCell>Название свойства</TableCell>
                <TableCell>Значение</TableCell>
                <TableCell>Единица измерения</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {propertyValues.map((pv) => (
                <TableRow key={pv.property.id}>
                  <TableCell>{pv.property.propertyName}</TableCell>
                  <TableCell>{pv.propertyValue}</TableCell>
                  <TableCell>{pv.property.unitOfMeasurement}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEditPropertyValue(pv)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeletePropertyValue(pv.property.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {propertyValues.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    У этого материала нет свойств. Нажмите "Добавить значение", чтобы добавить свойство.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {selectedProperty && properties.find(p => p.id === selectedProperty) ? 
            'Редактировать значение свойства' : 'Добавить значение свойства'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            <InputLabel id="property-select-label">Свойство</InputLabel>
            <Select
              labelId="property-select-label"
              id="property-select"
              value={selectedProperty}
              label="Свойство"
              onChange={handlePropertyChange}
            >
              {properties.map((property) => (
                <MenuItem key={property.id} value={property.id}>
                  {property.propertyName} ({property.unitOfMeasurement})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="propertyValue"
            label="Значение"
            type="number"
            fullWidth
            value={propertyValue}
            onChange={handleValueChange}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button onClick={handleAddPropertyValue} variant="contained">
            {selectedProperty && properties.find(p => p.id === selectedProperty) ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MaterialPropertyValuesEditor; 
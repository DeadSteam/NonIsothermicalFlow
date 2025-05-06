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
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  MaterialProperty,
  getAllProperties,
  createProperty,
  updateProperty,
  deleteProperty
} from '../../services/propertyService';

interface PropertyFormData {
  id: string | null;
  propertyName: string;
  unitOfMeasurement: string;
}

const PropertiesTable: React.FC = () => {
  const [properties, setProperties] = useState<MaterialProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<PropertyFormData>({
    id: null,
    propertyName: '',
    unitOfMeasurement: ''
  });
  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

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
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      id: null,
      propertyName: '',
      unitOfMeasurement: ''
    });
    setIsEdit(false);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = (): boolean => {
    if (!formData.propertyName.trim()) {
      setError('Пожалуйста, введите название свойства');
      return false;
    }

    if (!formData.unitOfMeasurement.trim()) {
      setError('Пожалуйста, введите единицу измерения');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const propertyData = {
        propertyName: formData.propertyName,
        unitOfMeasurement: formData.unitOfMeasurement,
        description: ''
      };

      if (isEdit && formData.id) {
        await updateProperty(formData.id, propertyData);
      } else {
        await createProperty(propertyData);
      }

      await fetchProperties();
      handleClose();
    } catch (err) {
      console.error('Ошибка при сохранении свойства:', err);
      setError('Ошибка при сохранении свойства');
    }
  };

  const handleEdit = (property: MaterialProperty) => {
    setFormData({
      id: property.id,
      propertyName: property.propertyName,
      unitOfMeasurement: property.unitOfMeasurement
    });
    setIsEdit(true);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить это свойство?')) {
      return;
    }

    try {
      await deleteProperty(id);
      await fetchProperties();
    } catch (err) {
      console.error('Ошибка при удалении свойства:', err);
      setError('Ошибка при удалении свойства');
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Управление свойствами материалов</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Добавить свойство
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
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Название свойства</TableCell>
                <TableCell>Единица измерения</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell>{property.propertyName}</TableCell>
                  <TableCell>{property.unitOfMeasurement}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEdit(property)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(property.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {isEdit ? 'Редактировать свойство' : 'Добавить свойство'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            name="propertyName"
            label="Название свойства"
            type="text"
            fullWidth
            value={formData.propertyName}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="unitOfMeasurement"
            label="Единица измерения"
            type="text"
            fullWidth
            value={formData.unitOfMeasurement}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button onClick={handleSubmit} variant="contained">
            {isEdit ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PropertiesTable; 
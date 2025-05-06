import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Property {
  id: number;
  name: string;
  unit: string;
  description: string;
}

const PropertiesManager: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    description: ''
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      // TODO: Заменить на реальный API-запрос
      const response = await fetch('/api/properties');
      const data = await response.json();
      setProperties(data);
    } catch (err) {
      console.error('Ошибка при загрузке свойств:', err);
      setError('Ошибка при загрузке свойств');
    }
  };

  const handleOpen = (property?: Property) => {
    if (property) {
      setSelectedProperty(property);
      setFormData({
        name: property.name,
        unit: property.unit,
        description: property.description
      });
    } else {
      setSelectedProperty(null);
      setFormData({
        name: '',
        unit: '',
        description: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        setError('Название свойства обязательно');
        return;
      }

      if (!formData.unit.trim()) {
        setError('Единица измерения обязательна');
        return;
      }

      const url = selectedProperty 
        ? `/api/properties/${selectedProperty.id}`
        : '/api/properties';
      
      const method = selectedProperty ? 'PUT' : 'POST';
      
      // TODO: Заменить на реальный API-запрос
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Ошибка при сохранении свойства');
      }

      await fetchProperties();
      handleClose();
    } catch (err) {
      console.error('Ошибка при сохранении свойства:', err);
      setError('Ошибка при сохранении свойства');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить это свойство?')) {
      return;
    }

    try {
      // TODO: Заменить на реальный API-запрос
      const response = await fetch(`/api/properties/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Ошибка при удалении свойства');
      }

      await fetchProperties();
    } catch (err) {
      console.error('Ошибка при удалении свойства:', err);
      setError('Ошибка при удалении свойства');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#1a237e' }}>
          Управление свойствами материалов
        </Typography>
        <Button
          variant="contained"
          onClick={() => handleOpen()}
          sx={{
            bgcolor: '#3f51b5',
            '&:hover': {
              bgcolor: '#283593'
            }
          }}
        >
          Добавить свойство
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Единица измерения</TableCell>
              <TableCell>Описание</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {properties.map((property) => (
              <TableRow key={property.id}>
                <TableCell>{property.name}</TableCell>
                <TableCell>{property.unit}</TableCell>
                <TableCell>{property.description}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpen(property)} color="primary">
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

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {selectedProperty ? 'Редактировать свойство' : 'Добавить свойство'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Название свойства"
            type="text"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="unit"
            label="Единица измерения"
            type="text"
            fullWidth
            value={formData.unit}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Описание"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={formData.description}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedProperty ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PropertiesManager; 
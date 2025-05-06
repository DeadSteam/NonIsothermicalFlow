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
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Coefficient {
  id: number;
  name: string;
  symbol: string;
  description: string;
}

const CoefficientsManager: React.FC = () => {
  const [coefficients, setCoefficients] = useState<Coefficient[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedCoefficient, setSelectedCoefficient] = useState<Coefficient | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: ''
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCoefficients();
  }, []);

  const fetchCoefficients = async () => {
    try {
      // TODO: Заменить на реальный API-запрос
      const response = await fetch('/api/coefficients');
      const data = await response.json();
      setCoefficients(data);
    } catch (err) {
      console.error('Ошибка при загрузке коэффициентов:', err);
      setError('Ошибка при загрузке коэффициентов');
    }
  };

  const handleOpen = (coefficient?: Coefficient) => {
    if (coefficient) {
      setSelectedCoefficient(coefficient);
      setFormData({
        name: coefficient.name,
        symbol: coefficient.symbol,
        description: coefficient.description
      });
    } else {
      setSelectedCoefficient(null);
      setFormData({
        name: '',
        symbol: '',
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
        setError('Название коэффициента обязательно');
        return;
      }

      if (!formData.symbol.trim()) {
        setError('Символ коэффициента обязателен');
        return;
      }

      const url = selectedCoefficient 
        ? `/api/coefficients/${selectedCoefficient.id}`
        : '/api/coefficients';
      
      const method = selectedCoefficient ? 'PUT' : 'POST';
      
      // TODO: Заменить на реальный API-запрос
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Ошибка при сохранении коэффициента');
      }

      await fetchCoefficients();
      handleClose();
    } catch (err) {
      console.error('Ошибка при сохранении коэффициента:', err);
      setError('Ошибка при сохранении коэффициента');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот коэффициент?')) {
      return;
    }

    try {
      // TODO: Заменить на реальный API-запрос
      const response = await fetch(`/api/coefficients/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Ошибка при удалении коэффициента');
      }

      await fetchCoefficients();
    } catch (err) {
      console.error('Ошибка при удалении коэффициента:', err);
      setError('Ошибка при удалении коэффициента');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#1a237e' }}>
          Управление коэффициентами
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
          Добавить коэффициент
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
              <TableCell>Символ</TableCell>
              <TableCell>Описание</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {coefficients.map((coefficient) => (
              <TableRow key={coefficient.id}>
                <TableCell>{coefficient.name}</TableCell>
                <TableCell>{coefficient.symbol}</TableCell>
                <TableCell>{coefficient.description}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpen(coefficient)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(coefficient.id)} color="error">
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
          {selectedCoefficient ? 'Редактировать коэффициент' : 'Добавить коэффициент'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Название коэффициента"
            type="text"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="symbol"
            label="Символ"
            type="text"
            fullWidth
            value={formData.symbol}
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
            {selectedCoefficient ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CoefficientsManager; 
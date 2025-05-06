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
  ProcessParams,
  getAllProcessParams,
  createProcessParams,
  updateProcessParams,
  deleteProcessParams
} from '../../../services/processParamsService';

interface ProcessParamsFormData {
  id: string | null;
  coverSpeed: string;
  coverTemperature: string;
}

const ProcessParamsTable: React.FC = () => {
  const [processParams, setProcessParams] = useState<ProcessParams[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<ProcessParamsFormData>({
    id: null,
    coverSpeed: '',
    coverTemperature: ''
  });
  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProcessParams();
  }, []);

  const fetchProcessParams = async () => {
    try {
      setLoading(true);
      const data = await getAllProcessParams();
      setProcessParams(data);
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке параметров процесса:', err);
      setError('Ошибка при загрузке параметров процесса');
    } finally {
      setLoading(false);
    }
  };

  const validateNumericInput = (value: string): boolean => {
    const numValue = parseFloat(value);
    return !isNaN(numValue) && numValue > 0;
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
      coverSpeed: '',
      coverTemperature: ''
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
    if (!validateNumericInput(formData.coverSpeed)) {
      setError('Скорость движения крышки должна быть положительным числом');
      return false;
    }

    if (!validateNumericInput(formData.coverTemperature)) {
      setError('Температура крышки должна быть положительным числом');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const paramsData = {
        coverSpeed: parseFloat(formData.coverSpeed),
        coverTemperature: parseFloat(formData.coverTemperature)
      };

      if (isEdit && formData.id) {
        await updateProcessParams(formData.id, paramsData);
      } else {
        await createProcessParams(paramsData);
      }

      await fetchProcessParams();
      handleClose();
    } catch (err) {
      console.error('Ошибка при сохранении параметров процесса:', err);
      setError('Ошибка при сохранении параметров процесса');
    }
  };

  const handleEdit = (params: ProcessParams) => {
    setFormData({
      id: params.id,
      coverSpeed: params.coverSpeed.toString(),
      coverTemperature: params.coverTemperature.toString()
    });
    setIsEdit(true);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить эти параметры процесса?')) {
      return;
    }

    try {
      await deleteProcessParams(id);
      await fetchProcessParams();
    } catch (err) {
      console.error('Ошибка при удалении параметров процесса:', err);
      setError('Ошибка при удалении параметров процесса');
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Управление параметрами процесса</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Добавить параметры
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
                <TableCell>Скорость движения крышки (м/с)</TableCell>
                <TableCell>Температура крышки (°C)</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {processParams.map((params) => (
                <TableRow key={params.id}>
                  <TableCell>{params.coverSpeed}</TableCell>
                  <TableCell>{params.coverTemperature}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEdit(params)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(params.id)} color="error">
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
          {isEdit ? 'Редактировать параметры' : 'Добавить параметры'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            margin="dense"
            name="coverSpeed"
            label="Скорость движения крышки (м/с)"
            type="number"
            fullWidth
            value={formData.coverSpeed}
            onChange={handleInputChange}
            inputProps={{ min: 0, step: "0.1" }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="coverTemperature"
            label="Температура крышки (°C)"
            type="number"
            fullWidth
            value={formData.coverTemperature}
            onChange={handleInputChange}
            inputProps={{ min: 0, step: "0.1" }}
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

export default ProcessParamsTable; 
import React, { useState } from 'react';
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
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Process Parameters type definition
interface ProcessParams {
  id: number;
  coverSpeed: number;
  coverTemperature: number;
}

// Mock data
const initialProcessParams: ProcessParams[] = [
  { id: 1, coverSpeed: 0.1, coverTemperature: 120 },
  { id: 2, coverSpeed: 0.2, coverTemperature: 150 },
  { id: 3, coverSpeed: 0.3, coverTemperature: 180 },
];

interface ProcessParamsFormData {
  id: number | null;
  coverSpeed: string;
  coverTemperature: string;
}

const ProcessParamsTable: React.FC = () => {
  const [processParams, setProcessParams] = useState<ProcessParams[]>(initialProcessParams);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<ProcessParamsFormData>({
    id: null,
    coverSpeed: '',
    coverTemperature: '',
  });
  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      coverTemperature: '',
    });
    setIsEdit(false);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
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

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    if (isEdit) {
      // Update existing process parameters
      setProcessParams(
        processParams.map((param) =>
          param.id === formData.id
            ? {
                ...param,
                coverSpeed: parseFloat(formData.coverSpeed),
                coverTemperature: parseFloat(formData.coverTemperature),
              }
            : param
        )
      );
    } else {
      // Add new process parameters
      const newProcessParam: ProcessParams = {
        id: processParams.length > 0 ? Math.max(...processParams.map((p) => p.id)) + 1 : 1,
        coverSpeed: parseFloat(formData.coverSpeed),
        coverTemperature: parseFloat(formData.coverTemperature),
      };
      setProcessParams([...processParams, newProcessParam]);
    }

    handleClose();
  };

  const handleEdit = (param: ProcessParams) => {
    setFormData({
      id: param.id,
      coverSpeed: param.coverSpeed.toString(),
      coverTemperature: param.coverTemperature.toString(),
    });
    setIsEdit(true);
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    setProcessParams(processParams.filter((param) => param.id !== id));
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

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Скорость движения крышки (м/с)</TableCell>
              <TableCell>Температура крышки (°C)</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {processParams.map((param) => (
              <TableRow key={param.id}>
                <TableCell component="th" scope="row">
                  {param.id}
                </TableCell>
                <TableCell>{param.coverSpeed}</TableCell>
                <TableCell>{param.coverTemperature}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleEdit(param)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(param.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEdit ? 'Редактировать параметры процесса' : 'Добавить параметры процесса'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            id="coverSpeed"
            name="coverSpeed"
            label="Скорость движения крышки (м/с)"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.coverSpeed}
            onChange={handleInputChange}
            inputProps={{ min: 0, step: "0.01" }}
          />
          <TextField
            margin="dense"
            id="coverTemperature"
            name="coverTemperature"
            label="Температура крышки (°C)"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.coverTemperature}
            onChange={handleInputChange}
            inputProps={{ min: 0, step: "0.1" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button onClick={handleSubmit}>
            {isEdit ? 'Обновить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProcessParamsTable; 
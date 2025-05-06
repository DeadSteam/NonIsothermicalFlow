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
  EmpiricalCoefficient,
  getAllCoefficients,
  createCoefficient,
  updateCoefficient,
  deleteCoefficient
} from '../../services/coefficientService';

interface CoefficientFormData {
  id: string | null;
  coefficientName: string;
  unitOfMeasurement: string;
}

const CoefficientsTable: React.FC = () => {
  const [coefficients, setCoefficients] = useState<EmpiricalCoefficient[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CoefficientFormData>({
    id: null,
    coefficientName: '',
    unitOfMeasurement: ''
  });
  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCoefficients();
  }, []);

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
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      id: null,
      coefficientName: '',
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
    if (!formData.coefficientName.trim()) {
      setError('Пожалуйста, введите название коэффициента');
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
      const coefficientData = {
        coefficientName: formData.coefficientName,
        unitOfMeasurement: formData.unitOfMeasurement
      };

      if (isEdit && formData.id) {
        await updateCoefficient(formData.id, coefficientData);
      } else {
        await createCoefficient(coefficientData);
      }

      await fetchCoefficients();
      handleClose();
    } catch (err) {
      console.error('Ошибка при сохранении коэффициента:', err);
      setError('Ошибка при сохранении коэффициента');
    }
  };

  const handleEdit = (coefficient: EmpiricalCoefficient) => {
    setFormData({
      id: coefficient.id,
      coefficientName: coefficient.coefficientName,
      unitOfMeasurement: coefficient.unitOfMeasurement
    });
    setIsEdit(true);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот коэффициент?')) {
      return;
    }

    try {
      await deleteCoefficient(id);
      await fetchCoefficients();
    } catch (err) {
      console.error('Ошибка при удалении коэффициента:', err);
      setError('Ошибка при удалении коэффициента');
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Управление эмпирическими коэффициентами</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Добавить коэффициент
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
                <TableCell>Название коэффициента</TableCell>
                <TableCell>Единица измерения</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {coefficients.map((coefficient) => (
                <TableRow key={coefficient.id}>
                  <TableCell>{coefficient.coefficientName}</TableCell>
                  <TableCell>{coefficient.unitOfMeasurement}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEdit(coefficient)} color="primary">
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
      )}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {isEdit ? 'Редактировать коэффициент' : 'Добавить коэффициент'}
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
            name="coefficientName"
            label="Название коэффициента"
            type="text"
            fullWidth
            value={formData.coefficientName}
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

export default CoefficientsTable; 
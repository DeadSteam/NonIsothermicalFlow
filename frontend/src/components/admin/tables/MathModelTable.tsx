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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { 
  MathModel,
  getAllMathModels,
  createMathModel,
  updateMathModel,
  deleteMathModel
} from '../../../services/mathModelService';
import { Material, getAllMaterials } from '../../../services/materialService';

interface MathModelFormData {
  id: string | null;
  consistencyCoefficient: string;
  tempViscosityCoefficient: string;
  castingTemperature: string;
  flowIndex: string;
  coverHeatTransferCoefficient: string;
  materialId: string;
}

const MathModelTable: React.FC = () => {
  const [mathModels, setMathModels] = useState<MathModel[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<MathModelFormData>({
    id: null,
    consistencyCoefficient: '',
    tempViscosityCoefficient: '',
    castingTemperature: '',
    flowIndex: '',
    coverHeatTransferCoefficient: '',
    materialId: ''
  });
  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mathModelsData, materialsData] = await Promise.all([
        getAllMathModels(),
        getAllMaterials()
      ]);
      setMathModels(mathModelsData);
      setMaterials(materialsData);
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке данных:', err);
      setError('Ошибка при загрузке данных');
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
      consistencyCoefficient: '',
      tempViscosityCoefficient: '',
      castingTemperature: '',
      flowIndex: '',
      coverHeatTransferCoefficient: '',
      materialId: ''
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

  const handleSelectChange = (e: any) => {
    setFormData({
      ...formData,
      materialId: e.target.value,
    });
  };

  const validateForm = (): boolean => {
    if (!formData.materialId) {
      setError('Пожалуйста, выберите материал');
      return false;
    }

    if (!validateNumericInput(formData.consistencyCoefficient)) {
      setError('Коэффициент консистенции должен быть положительным числом');
      return false;
    }

    if (!validateNumericInput(formData.tempViscosityCoefficient)) {
      setError('Температурный коэффициент вязкости должен быть положительным числом');
      return false;
    }

    if (!validateNumericInput(formData.castingTemperature)) {
      setError('Температура приведения должна быть положительным числом');
      return false;
    }

    if (!validateNumericInput(formData.flowIndex)) {
      setError('Индекс течения материала должен быть положительным числом');
      return false;
    }

    if (!validateNumericInput(formData.coverHeatTransferCoefficient)) {
      setError('Коэффициент теплоотдачи крышки должен быть положительным числом');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const modelData = {
        consistencyCoefficient: parseFloat(formData.consistencyCoefficient),
        tempViscosityCoefficient: parseFloat(formData.tempViscosityCoefficient),
        castingTemperature: parseFloat(formData.castingTemperature),
        flowIndex: parseFloat(formData.flowIndex),
        coverHeatTransferCoefficient: parseFloat(formData.coverHeatTransferCoefficient),
        materialId: formData.materialId
      };

      if (isEdit && formData.id) {
        await updateMathModel(formData.id, modelData);
      } else {
        await createMathModel(modelData);
      }

      await fetchData();
      handleClose();
    } catch (err) {
      console.error('Ошибка при сохранении математической модели:', err);
      setError('Ошибка при сохранении математической модели');
    }
  };

  const handleEdit = (model: MathModel) => {
    setFormData({
      id: model.id,
      consistencyCoefficient: model.consistencyCoefficient.toString(),
      tempViscosityCoefficient: model.tempViscosityCoefficient.toString(),
      castingTemperature: model.castingTemperature.toString(),
      flowIndex: model.flowIndex.toString(),
      coverHeatTransferCoefficient: model.coverHeatTransferCoefficient.toString(),
      materialId: model.materialId
    });
    setIsEdit(true);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту математическую модель?')) {
      return;
    }

    try {
      await deleteMathModel(id);
      await fetchData();
    } catch (err) {
      console.error('Ошибка при удалении математической модели:', err);
      setError('Ошибка при удалении математической модели');
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Управление математическими моделями</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Добавить модель
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
                <TableCell>Материал</TableCell>
                <TableCell>Коэффициент консистенции</TableCell>
                <TableCell>Температурный коэффициент вязкости</TableCell>
                <TableCell>Температура приведения (°C)</TableCell>
                <TableCell>Индекс течения</TableCell>
                <TableCell>Коэффициент теплоотдачи крышки</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mathModels.map((model) => (
                <TableRow key={model.id}>
                  <TableCell>{model.materialName}</TableCell>
                  <TableCell>{model.consistencyCoefficient}</TableCell>
                  <TableCell>{model.tempViscosityCoefficient}</TableCell>
                  <TableCell>{model.castingTemperature}</TableCell>
                  <TableCell>{model.flowIndex}</TableCell>
                  <TableCell>{model.coverHeatTransferCoefficient}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEdit(model)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(model.id)} color="error">
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
          {isEdit ? 'Редактировать модель' : 'Добавить модель'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <FormControl fullWidth margin="dense">
            <InputLabel id="material-label">Материал</InputLabel>
            <Select
              labelId="material-label"
              id="materialId"
              value={formData.materialId}
              label="Материал"
              onChange={handleSelectChange}
            >
              <MenuItem value="" disabled>Выберите материал</MenuItem>
              {materials.map((material) => (
                <MenuItem key={material.id} value={material.id}>
                  {material.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            name="consistencyCoefficient"
            label="Коэффициент консистенции"
            type="number"
            fullWidth
            value={formData.consistencyCoefficient}
            onChange={handleInputChange}
            inputProps={{ min: 0, step: "0.1" }}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            name="tempViscosityCoefficient"
            label="Температурный коэффициент вязкости"
            type="number"
            fullWidth
            value={formData.tempViscosityCoefficient}
            onChange={handleInputChange}
            inputProps={{ min: 0, step: "0.001" }}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            name="castingTemperature"
            label="Температура приведения (°C)"
            type="number"
            fullWidth
            value={formData.castingTemperature}
            onChange={handleInputChange}
            inputProps={{ min: 0, step: "0.1" }}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            name="flowIndex"
            label="Индекс течения материала"
            type="number"
            fullWidth
            value={formData.flowIndex}
            onChange={handleInputChange}
            inputProps={{ min: 0, step: "0.01" }}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            name="coverHeatTransferCoefficient"
            label="Коэффициент теплоотдачи крышки"
            type="number"
            fullWidth
            value={formData.coverHeatTransferCoefficient}
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

export default MathModelTable; 
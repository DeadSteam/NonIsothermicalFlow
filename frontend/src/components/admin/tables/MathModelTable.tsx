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
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Math Model type definition
interface MathModel {
  id: number;
  consistencyCoefficient: number;
  tempViscosityCoefficient: number;
  castingTemperature: number;
  flowIndex: number;
  coverHeatTransferCoefficient: number;
  materialId: number;
  materialName: string;
}

// Material type definition
interface Material {
  id: number;
  name: string;
}

// Mock data
const mockMaterials: Material[] = [
  { id: 1, name: 'PLA' },
  { id: 2, name: 'ABS' },
  { id: 3, name: 'PET' }
];

const initialMathModels: MathModel[] = [
  { 
    id: 1, 
    consistencyCoefficient: 780, 
    tempViscosityCoefficient: 0.007, 
    castingTemperature: 160, 
    flowIndex: 0.35, 
    coverHeatTransferCoefficient: 50,
    materialId: 1,
    materialName: 'PLA'
  },
  { 
    id: 2, 
    consistencyCoefficient: 650, 
    tempViscosityCoefficient: 0.009, 
    castingTemperature: 230, 
    flowIndex: 0.40, 
    coverHeatTransferCoefficient: 55,
    materialId: 2,
    materialName: 'ABS'
  }
];

interface MathModelFormData {
  id: number | null;
  consistencyCoefficient: string;
  tempViscosityCoefficient: string;
  castingTemperature: string;
  flowIndex: string;
  coverHeatTransferCoefficient: string;
  materialId: number;
}

const MathModelTable: React.FC = () => {
  const [mathModels, setMathModels] = useState<MathModel[]>(initialMathModels);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<MathModelFormData>({
    id: null,
    consistencyCoefficient: '',
    tempViscosityCoefficient: '',
    castingTemperature: '',
    flowIndex: '',
    coverHeatTransferCoefficient: '',
    materialId: 0
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
      consistencyCoefficient: '',
      tempViscosityCoefficient: '',
      castingTemperature: '',
      flowIndex: '',
      coverHeatTransferCoefficient: '',
      materialId: 0
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
    if (formData.materialId === 0) {
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

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const selectedMaterial = mockMaterials.find(m => m.id === formData.materialId);
    if (!selectedMaterial) {
      setError('Выбранный материал не найден');
      return;
    }

    if (isEdit) {
      // Update existing math model
      setMathModels(
        mathModels.map((model) =>
          model.id === formData.id
            ? {
                ...model,
                consistencyCoefficient: parseFloat(formData.consistencyCoefficient),
                tempViscosityCoefficient: parseFloat(formData.tempViscosityCoefficient),
                castingTemperature: parseFloat(formData.castingTemperature),
                flowIndex: parseFloat(formData.flowIndex),
                coverHeatTransferCoefficient: parseFloat(formData.coverHeatTransferCoefficient),
                materialId: formData.materialId,
                materialName: selectedMaterial.name
              }
            : model
        )
      );
    } else {
      // Add new math model
      const newMathModel: MathModel = {
        id: mathModels.length > 0 ? Math.max(...mathModels.map((m) => m.id)) + 1 : 1,
        consistencyCoefficient: parseFloat(formData.consistencyCoefficient),
        tempViscosityCoefficient: parseFloat(formData.tempViscosityCoefficient),
        castingTemperature: parseFloat(formData.castingTemperature),
        flowIndex: parseFloat(formData.flowIndex),
        coverHeatTransferCoefficient: parseFloat(formData.coverHeatTransferCoefficient),
        materialId: formData.materialId,
        materialName: selectedMaterial.name
      };
      setMathModels([...mathModels, newMathModel]);
    }

    handleClose();
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

  const handleDelete = (id: number) => {
    setMathModels(mathModels.filter((model) => model.id !== id));
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

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Материал</TableCell>
              <TableCell>Коэф. консистенции</TableCell>
              <TableCell>Темп. коэф. вязкости</TableCell>
              <TableCell>Темп. приведения (°C)</TableCell>
              <TableCell>Индекс течения</TableCell>
              <TableCell>Коэф. теплоотдачи крышки</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mathModels.map((model) => (
              <TableRow key={model.id}>
                <TableCell component="th" scope="row">
                  {model.id}
                </TableCell>
                <TableCell>{model.materialName}</TableCell>
                <TableCell>{model.consistencyCoefficient}</TableCell>
                <TableCell>{model.tempViscosityCoefficient}</TableCell>
                <TableCell>{model.castingTemperature}</TableCell>
                <TableCell>{model.flowIndex}</TableCell>
                <TableCell>{model.coverHeatTransferCoefficient}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleEdit(model)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(model.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEdit ? 'Редактировать модель' : 'Добавить модель'}</DialogTitle>
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
              <MenuItem value={0} disabled>Выберите материал</MenuItem>
              {mockMaterials.map((material) => (
                <MenuItem key={material.id} value={material.id}>
                  {material.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            id="consistencyCoefficient"
            name="consistencyCoefficient"
            label="Коэффициент консистенции"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.consistencyCoefficient}
            onChange={handleInputChange}
            inputProps={{ min: 0, step: "0.1" }}
          />
          
          <TextField
            margin="dense"
            id="tempViscosityCoefficient"
            name="tempViscosityCoefficient"
            label="Температурный коэффициент вязкости"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.tempViscosityCoefficient}
            onChange={handleInputChange}
            inputProps={{ min: 0, step: "0.001" }}
          />

          <TextField
            margin="dense"
            id="castingTemperature"
            name="castingTemperature"
            label="Температура приведения (°C)"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.castingTemperature}
            onChange={handleInputChange}
            inputProps={{ min: 0, step: "0.1" }}
          />

          <TextField
            margin="dense"
            id="flowIndex"
            name="flowIndex"
            label="Индекс течения материала"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.flowIndex}
            onChange={handleInputChange}
            inputProps={{ min: 0, step: "0.01" }}
          />

          <TextField
            margin="dense"
            id="coverHeatTransferCoefficient"
            name="coverHeatTransferCoefficient"
            label="Коэффициент теплоотдачи крышки"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.coverHeatTransferCoefficient}
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

export default MathModelTable; 
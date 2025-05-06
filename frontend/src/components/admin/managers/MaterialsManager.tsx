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
import { Material, getAllMaterials, createMaterial, updateMaterial, deleteMaterial } from '../../../services/materialService';

const MaterialsManager: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    materialType: '',
    description: ''
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const data = await getAllMaterials();
      setMaterials(data);
    } catch (err) {
      console.error('Ошибка при загрузке материалов:', err);
      setError('Ошибка при загрузке материалов');
    }
  };

  const handleOpen = (material?: Material) => {
    if (material) {
      setSelectedMaterial(material);
      setFormData({
        name: material.name,
        materialType: material.materialType,
        description: ''
      });
    } else {
      setSelectedMaterial(null);
      setFormData({
        name: '',
        materialType: '',
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
        setError('Название материала обязательно');
        return;
      }

      if (!formData.materialType.trim()) {
        setError('Тип материала обязателен');
        return;
      }

      const materialData = {
        name: formData.name,
        materialType: formData.materialType,
        propertyValues: [],
        coefficientValues: []
      };

      if (selectedMaterial) {
        await updateMaterial(selectedMaterial.id, materialData);
      } else {
        await createMaterial(materialData);
      }

      await fetchMaterials();
      handleClose();
    } catch (err) {
      console.error('Ошибка при сохранении материала:', err);
      setError('Ошибка при сохранении материала');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот материал?')) {
      return;
    }

    try {
      await deleteMaterial(id);
      await fetchMaterials();
    } catch (err) {
      console.error('Ошибка при удалении материала:', err);
      setError('Ошибка при удалении материала');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#1a237e' }}>
          Управление материалами
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
          Добавить материал
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
              <TableCell>Тип материала</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {materials.map((material) => (
              <TableRow key={material.id}>
                <TableCell>{material.name}</TableCell>
                <TableCell>{material.materialType}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpen(material)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(material.id)} color="error">
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
          {selectedMaterial ? 'Редактировать материал' : 'Добавить материал'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Название материала"
            type="text"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="materialType"
            label="Тип материала"
            type="text"
            fullWidth
            value={formData.materialType}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedMaterial ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaterialsManager; 
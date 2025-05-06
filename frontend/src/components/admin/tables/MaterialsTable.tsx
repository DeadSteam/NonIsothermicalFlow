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
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { 
  Material, 
  getAllMaterials, 
  createMaterial, 
  updateMaterial, 
  deleteMaterial,
  MaterialPropertyValue,
  MaterialCoefficientValue,
  addMaterialProperty,
  updateMaterialProperty,
  addMaterialCoefficient,
  updateMaterialCoefficient
} from '../../../services/materialService';
import { MaterialProperty, getAllProperties } from '../../../services/propertyService';
import { EmpiricalCoefficient, getAllCoefficients } from '../../../services/coefficientService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

interface MaterialFormData {
  id: string | null;
  name: string;
  materialType: string;
  propertyValues: MaterialPropertyValue[];
  coefficientValues: MaterialCoefficientValue[];
}

const MaterialsTable: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [properties, setProperties] = useState<MaterialProperty[]>([]);
  const [coefficients, setCoefficients] = useState<EmpiricalCoefficient[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState<MaterialFormData>({
    id: null,
    name: '',
    materialType: '',
    propertyValues: [],
    coefficientValues: []
  });
  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchMaterials(),
          fetchProperties(),
          fetchCoefficients()
        ]);
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const fetchMaterials = async () => {
    try {
      const data = await getAllMaterials();
      setMaterials(data);
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке материалов:', err);
      setError('Ошибка при загрузке материалов');
    }
  };

  const fetchProperties = async () => {
    try {
      console.log('Загрузка свойств...');
      const data = await getAllProperties();
      console.log('Загружены свойства:', data);
      setProperties(data);
    } catch (err) {
      console.error('Ошибка при загрузке свойств:', err);
      setError('Ошибка при загрузке свойств материалов');
    }
  };

  const fetchCoefficients = async () => {
    try {
      console.log('Загрузка коэффициентов...');
      const data = await getAllCoefficients();
      console.log('Загружены коэффициенты:', data);
      setCoefficients(data);
    } catch (err) {
      console.error('Ошибка при загрузке коэффициентов:', err);
      setError('Ошибка при загрузке коэффициентов материалов');
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
      name: '',
      materialType: '',
      propertyValues: [],
      coefficientValues: []
    });
    setIsEdit(false);
    setError(null);
    setTabValue(0);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePropertyValueChange = (propertyId: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    setFormData(prev => {
      const propertyValues = [...prev.propertyValues];
      const existingIndex = propertyValues.findIndex(pv => pv.property.id === propertyId);
      
      if (existingIndex >= 0) {
        propertyValues[existingIndex] = {
          ...propertyValues[existingIndex],
          propertyValue: numValue
        };
      } else {
        const property = properties.find(p => p.id === propertyId);
        if (property) {
          propertyValues.push({
            property,
            propertyValue: numValue
          });
        }
      }

      return {
        ...prev,
        propertyValues
      };
    });
  };

  const handleCoefficientValueChange = (coefficientId: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    setFormData(prev => {
      const coefficientValues = [...prev.coefficientValues];
      const existingIndex = coefficientValues.findIndex(cv => cv.coefficient.id === coefficientId);
      
      if (existingIndex >= 0) {
        coefficientValues[existingIndex] = {
          ...coefficientValues[existingIndex],
          coefficientValue: numValue
        };
      } else {
        const coefficient = coefficients.find(c => c.id === coefficientId);
        if (coefficient) {
          coefficientValues.push({
            coefficient,
            coefficientValue: numValue
          });
        }
      }

      return {
        ...prev,
        coefficientValues
      };
    });
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Пожалуйста, введите название материала');
      return false;
    }

    if (!formData.materialType.trim()) {
      setError('Пожалуйста, введите тип материала');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (isEdit && formData.id) {
        const materialData: Partial<Material> = {
          id: formData.id,
          name: formData.name,
          materialType: formData.materialType,
          propertyValues: formData.propertyValues,
          coefficientValues: formData.coefficientValues
        };
        await updateMaterial(formData.id, materialData);
      } else {
        await createMaterial(formData);
      }
      await fetchMaterials();
      handleClose();
    } catch (err) {
      console.error('Ошибка при сохранении материала:', err);
      setError('Ошибка при сохранении материала');
    }
  };

  const handleEdit = (material: Material) => {
    setFormData({
      id: material.id,
      name: material.name,
      materialType: material.materialType,
      propertyValues: material.propertyValues || [],
      coefficientValues: material.coefficientValues || []
    });
    setIsEdit(true);
    setOpen(true);
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

  const getPropertyValue = (material: Material, propertyId: string): number | null => {
    const propertyValue = material.propertyValues?.find(pv => pv.property.id === propertyId);
    return propertyValue ? propertyValue.propertyValue : null;
  };

  const getCoefficientValue = (material: Material, coefficientId: string): number | null => {
    const coefficientValue = material.coefficientValues?.find(cv => cv.coefficient.id === coefficientId);
    return coefficientValue ? coefficientValue.coefficientValue : null;
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Управление материалами</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Добавить материал
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
                <TableCell>Название</TableCell>
                <TableCell>Тип материала</TableCell>
                <TableCell>Свойства</TableCell>
                <TableCell>Коэффициенты</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell>{material.name}</TableCell>
                  <TableCell>{material.materialType}</TableCell>
                  <TableCell>
                    {material.propertyValues?.map((pv) => (
                      <div key={pv.property.id}>
                        {pv.property.propertyName}: {pv.propertyValue} {pv.property.unitOfMeasurement}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>
                    {material.coefficientValues?.map((cv) => (
                      <div key={cv.coefficient.id}>
                        {cv.coefficient.coefficientName}: {cv.coefficientValue} {cv.coefficient.unitOfMeasurement}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEdit(material)} color="primary">
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
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEdit ? 'Редактировать материал' : 'Добавить материал'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Основная информация" />
              <Tab label="Свойства" />
              <Tab label="Коэффициенты" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <TextField
              fullWidth
              label="Название материала"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Тип материала"
              name="materialType"
              value={formData.materialType}
              onChange={handleInputChange}
              margin="normal"
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {properties.map((property) => (
              <TextField
                key={property.id}
                fullWidth
                label={`${property.propertyName} (${property.unitOfMeasurement})`}
                type="number"
                value={formData.propertyValues.find(pv => pv.property.id === property.id)?.propertyValue || ''}
                onChange={(e) => handlePropertyValueChange(property.id, e.target.value)}
                margin="normal"
              />
            ))}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {coefficients.map((coefficient) => (
              <TextField
                key={coefficient.id}
                fullWidth
                label={`${coefficient.coefficientName} (${coefficient.unitOfMeasurement})`}
                type="number"
                value={formData.coefficientValues.find(cv => cv.coefficient.id === coefficient.id)?.coefficientValue || ''}
                onChange={(e) => handleCoefficientValueChange(coefficient.id, e.target.value)}
                margin="normal"
              />
            ))}
          </TabPanel>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {isEdit ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MaterialsTable; 
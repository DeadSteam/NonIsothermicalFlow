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
  Collapse,
  Tabs,
  Tab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import TuneIcon from '@mui/icons-material/Tune';
import { 
  Material, 
  getAllMaterials, 
  createMaterial, 
  updateMaterial, 
  deleteMaterial 
} from '../../../services/materialService';
import MaterialPropertyValuesEditor from '../MaterialPropertyValuesEditor';
import MaterialCoefficientValuesEditor from '../MaterialCoefficientValuesEditor';

interface MaterialFormData {
  id: string | null;
  name: string;
  materialType: string;
  propertyValues: Array<{
    property: {
      id: string;
      propertyName: string;
      unitOfMeasurement: string;
    };
    propertyValue: number;
  }>;
  coefficientValues: Array<{
    coefficient: {
      id: string;
      coefficientName: string;
      unitOfMeasurement: string;
    };
    coefficientValue: number;
  }>;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`material-tabpanel-${index}`}
      aria-labelledby={`material-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const MaterialsTable: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<MaterialFormData>({
    id: null,
    name: '',
    materialType: '',
    propertyValues: [],
    coefficientValues: []
  });
  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedMaterial, setExpandedMaterial] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const data = await getAllMaterials();
      setMaterials(data);
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке материалов:', err);
      setError('Ошибка при загрузке материалов');
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
      name: '',
      materialType: '',
      propertyValues: [],
      coefficientValues: []
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
        const updateData = {
          name: formData.name,
          materialType: formData.materialType,
          propertyValues: formData.propertyValues,
          coefficientValues: formData.coefficientValues
        };
        await updateMaterial(formData.id, updateData);
      } else {
        const createData = {
          name: formData.name,
          materialType: formData.materialType,
          propertyValues: formData.propertyValues,
          coefficientValues: formData.coefficientValues
        };
        await createMaterial(createData);
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
      propertyValues: material.propertyValues,
      coefficientValues: material.coefficientValues
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

  const handleExpandToggle = (materialId: string) => {
    if (expandedMaterial === materialId) {
      setExpandedMaterial(null);
    } else {
      setExpandedMaterial(materialId);
      setTabValue(0);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMaterialUpdate = (updatedMaterial: Material) => {
    setMaterials(prevMaterials => 
      prevMaterials.map(m => m.id === updatedMaterial.id ? updatedMaterial : m)
    );
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
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Тип материала</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materials.map((material) => (
                <React.Fragment key={material.id}>
                  <TableRow>
                    <TableCell>{material.name}</TableCell>
                    <TableCell>{material.materialType}</TableCell>
                    <TableCell align="right">
                      <IconButton 
                        onClick={() => handleExpandToggle(material.id)} 
                        color="primary"
                        title="Редактировать свойства и коэффициенты"
                      >
                        <TuneIcon />
                        {expandedMaterial === material.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                      <IconButton onClick={() => handleEdit(material)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(material.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ padding: 0 }} colSpan={3}>
                      <Collapse in={expandedMaterial === material.id} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2 }}>
                          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={tabValue} onChange={handleTabChange}>
                              <Tab label="Свойства" />
                              <Tab label="Коэффициенты" />
                            </Tabs>
                          </Box>
                          <TabPanel value={tabValue} index={0}>
                            <MaterialPropertyValuesEditor 
                              material={material}
                              onSave={handleMaterialUpdate}
                            />
                          </TabPanel>
                          <TabPanel value={tabValue} index={1}>
                            <MaterialCoefficientValuesEditor 
                              material={material}
                              onSave={handleMaterialUpdate}
                            />
                          </TabPanel>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {isEdit ? 'Редактировать материал' : 'Добавить материал'}
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
            {isEdit ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MaterialsTable; 
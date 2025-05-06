import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  TextField,
  Typography,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { Material, getAllMaterials, getMaterialById } from '../../services/materialService';
import { MathModel, ResultModel, runSimulation } from '../../services/simulationService';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import MaterialTable from '../materials/MaterialTable';
import * as XLSX from 'xlsx';

// Регистрация компонентов для Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Функция для форматирования размера памяти в читаемом виде 
 * @param bytes размер в байтах
 * @returns форматированная строка с единицами измерения
 */
const formatMemorySize = (bytes: number): string => {
  if (bytes < 0) return '0 Б';
  if (bytes < 1024) return bytes + ' Б';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' КБ';
  return (bytes / (1024 * 1024)).toFixed(2) + ' МБ';
};

// Общие стили для текстовых полей
const textFieldStyles = {
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': {
      borderColor: '#3f51b5',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#3f51b5',
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#3f51b5'
  }
};

// Обновляем интерфейс для отображения результатов в таблице
interface TableRow {
  position: number;
  temperature: number;
  viscosity: number;
  velocity: number;
  pressure: number;
}

// Функция для подготовки данных таблицы
const prepareTableData = (result: ResultModel, displayStep: number): TableRow[] => {
  if (!result.positions.length) return [];
  
  const tableData: TableRow[] = [];
  const maxPos = result.positions[result.positions.length - 1];
  
  // Первая позиция всегда включается
  tableData.push({
    position: result.positions[0],
    temperature: result.temperatures[0],
    viscosity: result.viscosities[0],
    velocity: result.velocities[0],
    pressure: result.pressures[0]
  });
  
  // Добавляем позиции с шагом displayStep
  let currentStep = displayStep;
  while (currentStep < maxPos) {
    // Найдем ближайшую позицию к текущему шагу
    const closestIndex = result.positions.findIndex(pos => pos >= currentStep);
    
    if (closestIndex !== -1) {
      tableData.push({
        position: result.positions[closestIndex],
        temperature: result.temperatures[closestIndex],
        viscosity: result.viscosities[closestIndex],
        velocity: result.velocities[closestIndex],
        pressure: result.pressures[closestIndex]
      });
    }
    
    currentStep += displayStep;
  }
  
  // Последняя позиция всегда включается, если она еще не добавлена
  const lastIndex = result.positions.length - 1;
  if (tableData[tableData.length - 1]?.position !== result.positions[lastIndex]) {
    tableData.push({
      position: result.positions[lastIndex],
      temperature: result.temperatures[lastIndex],
      viscosity: result.viscosities[lastIndex],
      velocity: result.velocities[lastIndex],
      pressure: result.pressures[lastIndex]
    });
  }
  
  return tableData;
};

// Стили для графиков
const chartStyles = {
  width: '100%',
  height: 400,
  padding: 2,
  backgroundColor: '#fff',
  borderRadius: 2,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
};

// Стили для таблиц
const tableStyles = {
  width: '100%',
  maxHeight: 500,
  overflow: 'auto',
  '& .MuiTableCell-root': {
    padding: '12px 16px',
    fontSize: '0.9rem'
  },
  '& .MuiTableHead-root': {
    backgroundColor: '#f5f5f5',
    '& .MuiTableCell-root': {
      fontWeight: 600,
      color: '#1a237e'
    }
  }
};

const SimulationPage: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultModel | null>(null);
  
  // Параметры модели расчетов
  const [model, setModel] = useState<MathModel>({
    width: 0.2,
    depth: 0.01,
    length: 8.0,
    density: 1200,
    heatCapacity: 1400,
    glassTransitionTemp: 150,
    meltingTemp: 230,
    coverSpeed: 0.9,
    coverTemp: 280,
    mu0: 8390,
    firstConstantVLF: 17.44,
    secondConstantVLF: 51.6,
    castingTemp: 280,
    flowIndex: 0.64,
    heatTransfer: 350,
    step: 0.01,
    displayStep: 0.5
  });

  // Загрузка материалов при загрузке компонента
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const data = await getAllMaterials();
        setMaterials(data);
      } catch (err) {
        console.error('Ошибка при загрузке материалов:', err);
        setError('Ошибка при загрузке материалов');
      }
    };

    fetchMaterials();
  }, []);

  // Обработчик изменения полей ввода
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Разрешаем пустое поле
    if (value === '') {
      setModel({
        ...model,
        [name]: value
      });
      return;
    }

    // Проверяем, является ли введенное значение допустимым числом
    // Разрешаем: цифры, одну точку или запятую, минус в начале
    const isValidInput = /^-?\d*[.,]?\d*$/.test(value);
    
    if (!isValidInput) {
      return; // Игнорируем недопустимый ввод
    }

    // Сохраняем значение как есть, с запятой
    setModel({
      ...model,
      [name]: value
    });
  };

  // Обработчик запуска симуляции
  const handleRunSimulation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Преобразуем все числовые значения, заменяя запятые на точки
      const normalizedModel: MathModel = {
        ...model,
        width: parseFloat(model.width.toString().replace(',', '.')),
        depth: parseFloat(model.depth.toString().replace(',', '.')),
        length: parseFloat(model.length.toString().replace(',', '.')),
        density: parseFloat(model.density.toString().replace(',', '.')),
        heatCapacity: parseFloat(model.heatCapacity.toString().replace(',', '.')),
        glassTransitionTemp: parseFloat(model.glassTransitionTemp.toString().replace(',', '.')),
        meltingTemp: parseFloat(model.meltingTemp.toString().replace(',', '.')),
        coverSpeed: parseFloat(model.coverSpeed.toString().replace(',', '.')),
        coverTemp: parseFloat(model.coverTemp.toString().replace(',', '.')),
        mu0: parseFloat(model.mu0.toString().replace(',', '.')),
        firstConstantVLF: parseFloat(model.firstConstantVLF.toString().replace(',', '.')),
        secondConstantVLF: parseFloat(model.secondConstantVLF.toString().replace(',', '.')),
        castingTemp: parseFloat(model.castingTemp.toString().replace(',', '.')),
        flowIndex: parseFloat(model.flowIndex.toString().replace(',', '.')),
        heatTransfer: parseFloat(model.heatTransfer.toString().replace(',', '.')),
        step: parseFloat(model.step.toString().replace(',', '.')),
        displayStep: parseFloat(model.displayStep.toString().replace(',', '.'))
      };
      
      const result = await runSimulation(normalizedModel);
      setResult(result);
    } catch (err) {
      console.error('Ошибка при выполнении моделирования:', err);
      setError('Ошибка при выполнении моделирования');
    } finally {
      setLoading(false);
    }
  };

  // Функция для экспорта данных в Excel
  const handleExportToExcel = () => {
    if (!result) return;

    // Подготовка данных для экспорта
    const data = [
      // Параметры модели
      { 'Параметр': 'Ширина канала (м)', 'Значение': model.width },
      { 'Параметр': 'Глубина канала (м)', 'Значение': model.depth },
      { 'Параметр': 'Длина канала (м)', 'Значение': model.length },
      { 'Параметр': 'Плотность (кг/м³)', 'Значение': model.density },
      { 'Параметр': 'Теплоёмкость (Дж/(кг·°C))', 'Значение': model.heatCapacity },
      { 'Параметр': 'Температура стеклования (°C)', 'Значение': model.glassTransitionTemp },
      { 'Параметр': 'Температура плавления (°C)', 'Значение': model.meltingTemp },
      { 'Параметр': 'Скорость движения крышки (м/с)', 'Значение': model.coverSpeed },
      { 'Параметр': 'Температура крышки (°C)', 'Значение': model.coverTemp },
      { 'Параметр': 'Температура литья (°C)', 'Значение': model.castingTemp },
      { 'Параметр': 'Начальная вязкость (Па·с)', 'Значение': model.mu0 },
      { 'Параметр': 'Первая константа ВЛФ', 'Значение': model.firstConstantVLF },
      { 'Параметр': 'Вторая константа ВЛФ', 'Значение': model.secondConstantVLF },
      { 'Параметр': 'Индекс течения', 'Значение': model.flowIndex },
      { 'Параметр': 'Коэффициент теплоотдачи (Вт/(м²·°C))', 'Значение': model.heatTransfer },
      { 'Параметр': 'Шаг сетки (м)', 'Значение': model.step },
      { 'Параметр': 'Количество пропусков шагов при выводе в таблицу', 'Значение': model.displayStep },
      
      // Показатели экономичности
      { 'Параметр': 'Время расчёта (с)', 'Значение': result.calculationTime },
      { 'Параметр': 'Количество операций', 'Значение': result.operationsCount },
      { 'Параметр': 'Использовано памяти (байт)', 'Значение': result.memoryUsage },
    ];

    // Создание рабочей книги Excel
    const wb = XLSX.utils.book_new();
    
    // Создание листа с параметрами
    const wsParams = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, wsParams, 'Параметры');

    // Создание листа с результатами
    const tableData = prepareTableData(result, model.displayStep);
    const wsResults = XLSX.utils.json_to_sheet(tableData);
    XLSX.utils.book_append_sheet(wb, wsResults, 'Результаты');

    // Сохранение файла
    XLSX.writeFile(wb, 'результаты_расчета.xlsx');
  };

  // Обработчик выбора материала
  const handleMaterialChange = async (event: SelectChangeEvent<string>) => {
    const materialId = event.target.value;
    
    try {
      if (!materialId) {
        setSelectedMaterial(null);
        return;
      }

      const material = await getMaterialById(materialId);
      setSelectedMaterial(material);
      applyMaterialProperties(material);
    } catch (err) {
      console.error('Ошибка при загрузке материала:', err);
      setError('Ошибка при загрузке материала');
    }
  };

  // Применение свойств выбранного материала к модели
  const applyMaterialProperties = (material: Material) => {
    // Создаем новую модель на основе текущей
    const newModel = { ...model };
    
    // Ищем нужные свойства в материале и применяем их к модели
    if (material.propertyValues) {
      material.propertyValues.forEach(pv => {
        const propName = pv.property.propertyName.toLowerCase();
        
        if (propName.includes('плотность')) {
          newModel.density = pv.propertyValue;
        } else if (propName.includes('теплоемкость')) {
          newModel.heatCapacity = pv.propertyValue;
        } else if (propName.includes('стеклования')) {
          newModel.glassTransitionTemp = pv.propertyValue;
        } else if (propName.includes('плавления')) {
          newModel.meltingTemp = pv.propertyValue;
        }
      });
    }

    if (material.coefficientValues) {
      material.coefficientValues.forEach(cv => {
        const coefName = cv.coefficient.coefficientName.toLowerCase();
        
        if (coefName.includes('консистенции')) {
          newModel.mu0 = cv.coefficientValue;
        } else if (coefName.includes('первая') && coefName.includes('влф')) {
          newModel.firstConstantVLF = cv.coefficientValue;
        } else if (coefName.includes('вторая') && coefName.includes('влф')) {
          newModel.secondConstantVLF = cv.coefficientValue;
        } else if (coefName.includes('течения')) {
          newModel.flowIndex = cv.coefficientValue;
        } else if (coefName.includes('теплоотдачи')) {
          newModel.heatTransfer = cv.coefficientValue;
        } else if (coefName.includes('приведения')) {
          newModel.castingTemp = cv.coefficientValue;
        }
      });
    }

    setModel(newModel);
  };

  return (
    <Box sx={{ 
      maxWidth: '100%', 
      margin: '0 auto', 
      padding: { xs: 2, md: 3 },
      '@media (min-width: 1920px)': {
        maxWidth: 1800
      }
    }}>
      <Typography variant="h4" gutterBottom sx={{ 
        color: '#1a237e',
        fontWeight: 600,
        textAlign: 'center',
        mb: 4
      }}>
        Течения аномально вязких материалов в канале
      </Typography>

      <Grid container spacing={3}>
        {/* Варьируемые параметры процесса */}
        <Grid item xs={12}>
          <Card sx={{ 
            borderRadius: 2, 
            boxShadow: '0 8px 24px rgba(21,39,75,0.12)',
            overflow: 'visible'
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ fontWeight: 600, color: '#1a237e', mb: 3 }}
              >
                Варьируемые параметры процесса
              </Typography>
              
              {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>{error}</Alert>}
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Скорость движения крышки (м/с)"
                    name="coverSpeed"
                    value={model.coverSpeed}
                    onChange={handleInputChange}
                    margin="normal"
                    variant="outlined"
                    sx={textFieldStyles}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Температура крышки (°C)"
                    name="coverTemp"
                    value={model.coverTemp}
                    onChange={handleInputChange}
                    margin="normal"
                    variant="outlined"
                    sx={textFieldStyles}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Температура литья (°C)"
                    name="castingTemp"
                    value={model.castingTemp}
                    onChange={handleInputChange}
                    margin="normal"
                    variant="outlined"
                    sx={textFieldStyles}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Входные параметры */}
        <Grid item xs={12}>
          <Card sx={{ 
            borderRadius: 2, 
            boxShadow: '0 8px 24px rgba(21,39,75,0.12)',
            overflow: 'visible'
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ fontWeight: 600, color: '#1a237e', mb: 3 }}
              >
                Входные параметры
              </Typography>

              {/* Геометрические параметры канала */}
              <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'rgba(63, 81, 181, 0.03)', borderRadius: 2 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 2,
                    fontSize: '1.1rem', 
                    fontWeight: 500,
                    color: '#283593',
                    borderBottom: '2px solid #3f51b5',
                    paddingBottom: 1,
                    display: 'inline-block'
                  }}
                >
                  Геометрические параметры канала
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Ширина канала (м)"
                      name="width"
                      value={model.width}
                      onChange={handleInputChange}
                      margin="normal"
                      variant="outlined"
                      sx={textFieldStyles}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Глубина канала (м)"
                      name="depth"
                      value={model.depth}
                      onChange={handleInputChange}
                      margin="normal"
                      variant="outlined"
                      sx={textFieldStyles}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Длина канала (м)"
                      name="length"
                      value={model.length}
                      onChange={handleInputChange}
                      margin="normal"
                      variant="outlined"
                      sx={textFieldStyles}
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* Тип материала */}
              <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'rgba(63, 81, 181, 0.03)', borderRadius: 2 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 2,
                    fontSize: '1.1rem', 
                    fontWeight: 500,
                    color: '#283593',
                    borderBottom: '2px solid #3f51b5',
                    paddingBottom: 1,
                    display: 'inline-block'
                  }}
                >
                  Тип материала
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="material-select-label">Материал</InputLabel>
                  <Select
                    labelId="material-select-label"
                    id="material-select"
                    value={selectedMaterial?.id || ''}
                    label="Материал"
                    onChange={handleMaterialChange}
                    disabled={loading}
                  >
                    <MenuItem value="">
                      <em>Не выбрано</em>
                    </MenuItem>
                    {materials.map((material) => (
                      <MenuItem key={material.id} value={material.id}>
                        {material.name} ({material.materialType})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Paper>

              {/* Свойства материала */}
              <Paper elevation={0} sx={{ p: 3, bgcolor: 'rgba(63, 81, 181, 0.03)', borderRadius: 2 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 2,
                    fontSize: '1.1rem', 
                    fontWeight: 500,
                    color: '#283593',
                    borderBottom: '2px solid #3f51b5',
                    paddingBottom: 1,
                    display: 'inline-block'
                  }}
                >
                  Свойства материала
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Плотность (кг/м³)"
                      name="density"
                      value={model.density}
                      onChange={handleInputChange}
                      margin="normal"
                      variant="outlined"
                      sx={textFieldStyles}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Теплоёмкость (Дж/(кг·°C))"
                      name="heatCapacity"
                      value={model.heatCapacity}
                      onChange={handleInputChange}
                      margin="normal"
                      variant="outlined"
                      sx={textFieldStyles}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Температура стеклования (°C)"
                      name="glassTransitionTemp"
                      value={model.glassTransitionTemp}
                      onChange={handleInputChange}
                      margin="normal"
                      variant="outlined"
                      sx={textFieldStyles}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Температура плавления (°C)"
                      name="meltingTemp"
                      value={model.meltingTemp}
                      onChange={handleInputChange}
                      margin="normal"
                      variant="outlined"
                      sx={textFieldStyles}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        {/* Параметры математической модели */}
        <Grid item xs={12}>
          <Card sx={{ 
            borderRadius: 2, 
            boxShadow: '0 8px 24px rgba(21,39,75,0.12)',
            overflow: 'visible'
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ fontWeight: 600, color: '#1a237e', mb: 3 }}
              >
                Параметры математической модели
              </Typography>

              {/* Эмпирические коэффициенты */}
              <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'rgba(63, 81, 181, 0.03)', borderRadius: 2 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 2,
                    fontSize: '1.1rem', 
                    fontWeight: 500,
                    color: '#283593',
                    borderBottom: '2px solid #3f51b5',
                    paddingBottom: 1,
                    display: 'inline-block'
                  }}
                >
                  Эмпирические коэффициенты
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Начальная вязкость (Па·с)"
                      name="mu0"
                      value={model.mu0}
                      onChange={handleInputChange}
                      margin="normal"
                      variant="outlined"
                      sx={textFieldStyles}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Первая константа ВЛФ"
                      name="firstConstantVLF"
                      value={model.firstConstantVLF}
                      onChange={handleInputChange}
                      margin="normal"
                      variant="outlined"
                      sx={textFieldStyles}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Вторая константа ВЛФ"
                      name="secondConstantVLF"
                      value={model.secondConstantVLF}
                      onChange={handleInputChange}
                      margin="normal"
                      variant="outlined"
                      sx={textFieldStyles}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Индекс течения"
                      name="flowIndex"
                      value={model.flowIndex}
                      onChange={handleInputChange}
                      margin="normal"
                      variant="outlined"
                      sx={textFieldStyles}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Коэффициент теплоотдачи (Вт/(м²·°C))"
                      name="heatTransfer"
                      value={model.heatTransfer}
                      onChange={handleInputChange}
                      margin="normal"
                      variant="outlined"
                      sx={textFieldStyles}
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* Параметры метода решения */}
              <Paper elevation={0} sx={{ p: 3, bgcolor: 'rgba(63, 81, 181, 0.03)', borderRadius: 2 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 2,
                    fontSize: '1.1rem', 
                    fontWeight: 500,
                    color: '#283593',
                    borderBottom: '2px solid #3f51b5',
                    paddingBottom: 1,
                    display: 'inline-block'
                  }}
                >
                  Параметры метода решения
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Шаг сетки (м)"
                      name="step"
                      value={model.step}
                      onChange={handleInputChange}
                      margin="normal"
                      variant="outlined"
                      sx={textFieldStyles}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Количество пропусков шагов при выводе в таблицу"
                      name="displayStep"
                      value={model.displayStep}
                      onChange={handleInputChange}
                      margin="normal"
                      variant="outlined"
                      sx={textFieldStyles}
                    />
                  </Grid>
                </Grid>
              </Paper>

              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleRunSimulation}
                  disabled={loading}
                  size="large"
                  sx={{ 
                    minWidth: 220, 
                    py: 1.5, 
                    borderRadius: 2,
                    boxShadow: '0 4px 14px rgba(63, 81, 181, 0.4)',
                    background: 'linear-gradient(45deg, #3f51b5 30%, #5c6bc0 90%)',
                    '&:hover': {
                      boxShadow: '0 6px 18px rgba(63, 81, 181, 0.6)',
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Запустить расчёт'}
                </Button>
                
                {result && (
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleExportToExcel}
                    size="large"
                    sx={{ 
                      minWidth: 220, 
                      py: 1.5, 
                      borderRadius: 2,
                      borderColor: '#3f51b5',
                      color: '#3f51b5',
                      '&:hover': {
                        borderColor: '#5c6bc0',
                        backgroundColor: 'rgba(63, 81, 181, 0.04)',
                      }
                    }}
                  >
                    Экспорт в Excel
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Результаты расчетов */}
        {result && (
          <>
            <Grid item xs={12}>
              <Divider sx={{ my: 4, opacity: 0.6 }} />
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  mb: 3, 
                  fontWeight: 600, 
                  color: '#1a237e',
                  textAlign: 'center'
                }}
              >
                Показатели экономичности
              </Typography>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  mb: 4, 
                  borderRadius: 2, 
                  boxShadow: '0 8px 24px rgba(21,39,75,0.12)',
                  border: '1px solid rgba(63, 81, 181, 0.12)',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f5f7ff 100%)'
                }}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body1">
                      <strong style={{ color: '#3f51b5' }}>Время расчета:</strong> {result.calculationTime.toFixed(3)} с
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body1">
                      <strong style={{ color: '#3f51b5' }}>Количество операций:</strong> {result.operationsCount.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body1">
                      <strong style={{ color: '#3f51b5' }}>Использовано памяти:</strong> {formatMemorySize(result.memoryUsage)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            <Grid container spacing={4} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 4,
                    borderRadius: 2, 
                    boxShadow: '0 8px 24px rgba(21,39,75,0.12)',
                    border: '1px solid rgba(63, 81, 181, 0.12)',
                    height: 600,
                    overflow: 'hidden'
                  }}
                >
                  <Line
                    data={{
                      labels: result.positions.map(pos => pos.toFixed(2)),
                      datasets: [{
                        label: 'Температура (°C)',
                        data: result.temperatures,
                        borderColor: '#3f51b5',
                        backgroundColor: 'rgba(63, 81, 181, 0.1)',
                        tension: 0.4
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        title: {
                          display: true,
                          text: 'Распределение температуры'
                        }
                      },
                      scales: {
                        x: {
                          title: {
                            display: true,
                            text: 'Координата (м)'
                          }
                        },
                        y: {
                          title: {
                            display: true,
                            text: 'Температура (°C)'
                          }
                        }
                      }
                    }}
                  />
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 4,
                    borderRadius: 2, 
                    boxShadow: '0 8px 24px rgba(21,39,75,0.12)',
                    border: '1px solid rgba(63, 81, 181, 0.12)',
                    height: 600,
                    overflow: 'hidden'
                  }}
                >
                  <Line
                    data={{
                      labels: result.positions.map(pos => pos.toFixed(2)),
                      datasets: [{
                        label: 'Вязкость (Па·с)',
                        data: result.viscosities,
                        borderColor: '#f50057',
                        backgroundColor: 'rgba(245, 0, 87, 0.1)',
                        tension: 0.4
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        title: {
                          display: true,
                          text: 'Распределение вязкости'
                        }
                      },
                      scales: {
                        x: {
                          title: {
                            display: true,
                            text: 'Координата (м)'
                          }
                        },
                        y: {
                          title: {
                            display: true,
                            text: 'Вязкость (Па·с)'
                          }
                        }
                      }
                    }}
                  />
                </Paper>
              </Grid>
            </Grid>

            {/* Таблицы результатов */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Таблицы результатов
                  </Typography>
                  <TableContainer component={Paper} sx={tableStyles}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Координата (м)</TableCell>
                          <TableCell>Температура (°C)</TableCell>
                          <TableCell>Вязкость (Па·с)</TableCell>
                          <TableCell>Скорость (м/с)</TableCell>
                          <TableCell>Давление (Па)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {result && prepareTableData(result, model.displayStep).map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{row.position.toFixed(3)}</TableCell>
                            <TableCell>{row.temperature.toFixed(2)}</TableCell>
                            <TableCell>{row.viscosity.toFixed(1)}</TableCell>
                            <TableCell>{row.velocity.toFixed(3)}</TableCell>
                            <TableCell>{row.pressure.toFixed(0)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default SimulationPage; 
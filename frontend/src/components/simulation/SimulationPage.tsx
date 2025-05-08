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

/**
 * Функция для подготовки данных для таблицы с заданным шагом
 * @param positions массив позиций
 * @param data массив данных (температура или вязкость)
 * @param displayStep шаг отображения в метрах
 * @returns массив объектов для таблицы
 */
interface TableDataItem {
  position: number;
  value: number;
}

const prepareTableData = (
  positions: number[], 
  data: number[], 
  displayStep: number
): TableDataItem[] => {
  if (!positions.length || !data.length) return [];
  
  const tableData: TableDataItem[] = [];
  const maxPos = positions[positions.length - 1];
  
  // Первая позиция всегда включается
  tableData.push({
    position: positions[0],
    value: data[0]
  });
  
  // Добавляем позиции с шагом displayStep
  let currentStep = displayStep;
  while (currentStep < maxPos) {
    // Найдем ближайшую позицию к текущему шагу
    const closestIndex = positions.findIndex(pos => pos >= currentStep);
    
    if (closestIndex !== -1) {
      tableData.push({
        position: positions[closestIndex],
        value: data[closestIndex]
      });
    }
    
    currentStep += displayStep;
  }
  
  // Последняя позиция всегда включается, если она еще не добавлена
  const lastPos = positions[positions.length - 1];
  const lastValue = data[data.length - 1];
  
  if (tableData[tableData.length - 1]?.position !== lastPos) {
    tableData.push({
      position: lastPos,
      value: lastValue
    });
  }
  
  return tableData;
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

  // Экспорт результатов в Excel
  const handleExportToExcel = () => {
    if (!result) return;

    const workbook = XLSX.utils.book_new();
    
    // Подготовка данных для таблицы результатов
    const tableData = result.positions.map((pos, index) => ({
      'Позиция (м)': pos,
      'Температура (°C)': result.temperatures[index],
      'Вязкость (Па·с)': result.viscosities[index]
    }));

    // Создание листа с результатами
    const worksheet = XLSX.utils.json_to_sheet(tableData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Результаты');

    // Подготовка данных для листа с показателями
    const performanceData = [
      { 'Показатель': 'Показатели экономичности', 'Значение': '' },
      { 'Показатель': 'Производительность (кг/ч)', 'Значение': result.productivity },
      { 'Показатель': 'Конечная температура (°C)', 'Значение': result.finalTemperature },
      { 'Показатель': 'Конечная вязкость (Па·с)', 'Значение': result.finalViscosity },
      { 'Показатель': 'Время расчета (мс)', 'Значение': result.calculationTime },
      { 'Показатель': 'Количество операций', 'Значение': result.operationsCount },
      { 'Показатель': 'Использованная память (байт)', 'Значение': result.memoryUsage }
    ];

    // Создание листа с показателями
    const performanceSheet = XLSX.utils.json_to_sheet(performanceData);
    XLSX.utils.book_append_sheet(workbook, performanceSheet, 'Показатели');

    // Сохранение файла
    XLSX.writeFile(workbook, 'результаты_моделирования.xlsx');
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

  // Опции для графиков
  const tempChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Распределение температуры по длине канала',
        color: '#3f51b5',
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        displayColors: false,
        backgroundColor: 'rgba(53, 71, 125, 0.8)',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          title: function(context: any) {
            return `Координата: ${context[0].label} м`;
          },
          label: function(context: any) {
            return `${context.raw.toFixed(2)} °C`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Координата по длине канала (м)',
          color: '#3f51b5',
          padding: {
            top: 10
          }
        },
        grid: {
          color: 'rgba(63, 81, 181, 0.1)',
          borderColor: 'rgba(63, 81, 181, 0.3)',
          tickColor: 'rgba(63, 81, 181, 0.3)'
        },
        ticks: {
          color: '#666'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Температура (°C)',
          color: '#3f51b5',
          padding: {
            bottom: 10
          }
        },
        grid: {
          color: 'rgba(63, 81, 181, 0.1)',
          borderColor: 'rgba(63, 81, 181, 0.3)',
          tickColor: 'rgba(63, 81, 181, 0.3)'
        },
        ticks: {
          color: '#666'
        }
      }
    },
    elements: {
      line: {
        tension: 0.3,
        borderWidth: 3,
        fill: true,
        borderColor: 'rgb(255, 99, 132)'
      },
      point: {
        radius: 0,
        hoverRadius: 6
      }
    }
  };

  const viscChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Распределение вязкости по длине канала',
        color: '#3f51b5',
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        displayColors: false,
        backgroundColor: 'rgba(53, 71, 125, 0.8)',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          title: function(context: any) {
            return `Координата: ${context[0].label} м`;
          },
          label: function(context: any) {
            return `${context.raw.toFixed(1)} Па·с`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Координата по длине канала (м)',
          color: '#3f51b5',
          padding: {
            top: 10
          }
        },
        grid: {
          color: 'rgba(63, 81, 181, 0.1)',
          borderColor: 'rgba(63, 81, 181, 0.3)',
          tickColor: 'rgba(63, 81, 181, 0.3)'
        },
        ticks: {
          color: '#666'
        }
      },
      y: {
        title: {
          display: true, 
          text: 'Вязкость (Па·с)',
          color: '#3f51b5',
          padding: {
            bottom: 10
          }
        },
        grid: {
          color: 'rgba(63, 81, 181, 0.1)',
          borderColor: 'rgba(63, 81, 181, 0.3)',
          tickColor: 'rgba(63, 81, 181, 0.3)'
        },
        ticks: {
          color: '#666'
        }
      }
    },
    elements: {
      line: {
        tension: 0.3,
        borderWidth: 3,
        fill: true,
        borderColor: 'rgb(53, 162, 235)'
      },
      point: {
        radius: 0,
        hoverRadius: 6
      }
    }
  };

  // Данные для графиков
  const tempChartData = result ? {
    labels: result.positions.map(p => p.toFixed(3)),
    datasets: [
      {
        data: result.temperatures,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: function(context: any) {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) {
            return 'rgba(255, 99, 132, 0.5)';
          }
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(255, 99, 132, 0)');
          gradient.addColorStop(1, 'rgba(255, 99, 132, 0.5)');
          return gradient;
        },
        borderWidth: 3,
        tension: 0.3,
        fill: true
      }
    ],
  } : null;

  const viscChartData = result ? {
    labels: result.positions.map(p => p.toFixed(3)),
    datasets: [
      {
        data: result.viscosities,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: function(context: any) {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) {
            return 'rgba(53, 162, 235, 0.5)';
          }
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(53, 162, 235, 0)');
          gradient.addColorStop(1, 'rgba(53, 162, 235, 0.5)');
          return gradient;
        },
        borderWidth: 3,
        tension: 0.3,
        fill: true
      }
    ],
  } : null;

  return (
    <Box 
      sx={{ 
        p: 4,
        px: { xs: 2, sm: 4, md: 6, lg: 8 },
        bgcolor: '#f5f7fa',
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%)'
      }}
    >
      <Box
        sx={{
          maxWidth: '2400px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            mb: 4, 
            fontWeight: 600, 
            color: '#1a237e',
            textAlign: 'center',
            textShadow: '0px 1px 2px rgba(0,0,0,0.1)'
          }}
        >
          Течения аномально вязких материалов в канале
        </Typography>

        <Grid container spacing={4}>
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
                  Режимные параметры процесса
                </Typography>
                
                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>{error}</Alert>}
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Скорость крышки (м/с)"
                      name="coverSpeed"
                      value={model.coverSpeed}
                      onChange={handleInputChange}
                      margin="normal"
                      variant="outlined"
                      sx={textFieldStyles}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
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

                {/* Параметры свойств объекта */}
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
                    Параметры свойств объекта
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
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
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Удельная теплоемкость (Дж/(кг·°C))"
                        name="heatCapacity"
                        value={model.heatCapacity}
                        onChange={handleInputChange}
                        margin="normal"
                        variant="outlined"
                        sx={textFieldStyles}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Температура стеклования (°С)"
                        name="glassTransitionTemp"
                        value={model.glassTransitionTemp}
                        onChange={handleInputChange}
                        margin="normal"
                        variant="outlined"
                        sx={textFieldStyles}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
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

                {/* Эмпирические коэффициенты модели */}
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
                    Эмпирические коэффициенты модели
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Коэффициент консистенции (Па·с^n)"
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
                        label="Вторая константа ВЛФ (°С)"
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
                        label="Температура приведения (°C)"
                        name="castingTemp"
                        value={model.castingTemp}
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
                        label="Шаг расчета (м)"
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
                    {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Рассчитать'}
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
                        <strong style={{ color: '#3f51b5' }}>Производительность:</strong> {result.productivity.toFixed(2)} кг/ч
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body1">
                        <strong style={{ color: '#3f51b5' }}>Конечная температура:</strong> {result.finalTemperature.toFixed(2)} °C
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body1">
                        <strong style={{ color: '#3f51b5' }}>Конечная вязкость:</strong> {result.finalViscosity.toFixed(1)} Па·с
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
                    {tempChartData && <Line options={tempChartOptions} data={tempChartData} />}
                  </Paper>
                  {result && (
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 4,
                        mt: 3, 
                        borderRadius: 2, 
                        boxShadow: '0 8px 24px rgba(21,39,75,0.12)',
                        border: '1px solid rgba(63, 81, 181, 0.12)',
                        overflow: 'hidden'
                      }}
                    >
                      <Typography 
                        variant="h6" 
                        gutterBottom 
                        sx={{ 
                          fontSize: '1.2rem',
                          fontWeight: 500,
                          color: '#3f51b5',
                          borderBottom: '1px solid rgba(63, 81, 181, 0.3)',
                          pb: 1,
                          mb: 2
                        }}
                      >
                        Таблица температуры
                      </Typography>
                      <TableContainer sx={{ maxHeight: 400 }}>
                        <Table 
                          sx={{ 
                            '& .MuiTableCell-root': { 
                              borderBottom: '1px solid rgba(63, 81, 181, 0.1)',
                              fontSize: '1rem',
                              py: 1.5
                            }
                          }}
                        >
                          <TableHead>
                            <TableRow sx={{ 
                              '& .MuiTableCell-root': { 
                                fontWeight: 600, 
                                backgroundColor: 'rgba(63, 81, 181, 0.05)',
                                fontSize: '1.1rem',
                                whiteSpace: 'nowrap'
                              } 
                            }}>
                              <TableCell>Координата по длине канала (м)</TableCell>
                              <TableCell>Температура (°C)</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {prepareTableData(result.positions, result.temperatures, model.displayStep).map((row, index) => (
                              <TableRow 
                                key={`temp-${index}`}
                                sx={{ 
                                  '&:nth-of-type(odd)': { backgroundColor: 'rgba(63, 81, 181, 0.02)' },
                                  '&:hover': { backgroundColor: 'rgba(63, 81, 181, 0.05)' }
                                }}
                              >
                                <TableCell>{row.position.toFixed(3)}</TableCell>
                                <TableCell>{row.value.toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                  )}
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
                    {viscChartData && <Line options={viscChartOptions} data={viscChartData} />}
                  </Paper>
                  {result && (
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 4,
                        mt: 3, 
                        borderRadius: 2, 
                        boxShadow: '0 8px 24px rgba(21,39,75,0.12)',
                        border: '1px solid rgba(63, 81, 181, 0.12)',
                        overflow: 'hidden'
                      }}
                    >
                      <Typography 
                        variant="h6" 
                        gutterBottom 
                        sx={{ 
                          fontSize: '1.2rem',
                          fontWeight: 500,
                          color: '#3f51b5',
                          borderBottom: '1px solid rgba(63, 81, 181, 0.3)',
                          pb: 1,
                          mb: 2
                        }}
                      >
                        Таблица вязкости
                      </Typography>
                      <TableContainer sx={{ maxHeight: 400 }}>
                        <Table 
                          sx={{ 
                            '& .MuiTableCell-root': { 
                              borderBottom: '1px solid rgba(63, 81, 181, 0.1)',
                              fontSize: '1rem',
                              py: 1.5
                            }
                          }}
                        >
                          <TableHead>
                            <TableRow sx={{ 
                              '& .MuiTableCell-root': { 
                                fontWeight: 600, 
                                backgroundColor: 'rgba(63, 81, 181, 0.05)',
                                fontSize: '1.1rem',
                                whiteSpace: 'nowrap'
                              } 
                            }}>
                              <TableCell>Координата по длине канала (м)</TableCell>
                              <TableCell>Вязкость (Па·с)</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {prepareTableData(result.positions, result.viscosities, model.displayStep).map((row, index) => (
                              <TableRow 
                                key={`visc-${index}`}
                                sx={{ 
                                  '&:nth-of-type(odd)': { backgroundColor: 'rgba(63, 81, 181, 0.02)' },
                                  '&:hover': { backgroundColor: 'rgba(63, 81, 181, 0.05)' }
                                }}
                              >
                                <TableCell>{row.position.toFixed(3)}</TableCell>
                                <TableCell>{row.value.toFixed(1)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                  )}
                </Grid>
              </Grid>
              
              <Grid item xs={12}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    mt: 3, 
                    borderRadius: 2, 
                    boxShadow: '0 8px 24px rgba(21,39,75,0.12)',
                    border: '1px solid rgba(63, 81, 181, 0.12)',
                    background: 'linear-gradient(135deg, #fbfcff 0%, #f5f7ff 100%)'
                  }}
                >
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 500, 
                      color: '#3f51b5',
                      borderBottom: '1px solid rgba(63, 81, 181, 0.3)',
                      pb: 1,
                      mb: 2
                    }}
                  >
                    Производительность расчета
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body1">
                        <strong style={{ color: '#3f51b5' }}>Время расчета:</strong> {result.calculationTime.toFixed(2)} мс
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
            </>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default SimulationPage; 
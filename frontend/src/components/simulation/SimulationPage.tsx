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
  TableRow
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

  // Обработчик изменения полей формы
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    
    // Проверяем, является ли введенное значение положительным числом
    if (value === '' || isNaN(numValue)) {
      // Если поле пустое или не число, разрешаем (чтобы пользователь мог очистить поле)
      setModel({
        ...model,
        [name]: value
      });
    } else if (numValue >= 0) {
      // Если положительное число, обновляем модель
      setModel({
        ...model,
        [name]: numValue
      });
    }
    // Если отрицательное число, игнорируем изменение
  };

  // Обработчик запуска симуляции
  const handleRunSimulation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await runSimulation(model);
      setResult(result);
    } catch (err) {
      console.error('Ошибка при выполнении моделирования:', err);
      setError('Ошибка при выполнении моделирования');
    } finally {
      setLoading(false);
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
        } else if (coefName.includes('c1')) {
          newModel.firstConstantVLF = cv.coefficientValue;
        } else if (coefName.includes('c2')) {
          newModel.secondConstantVLF = cv.coefficientValue;
        } else if (coefName.includes('течения')) {
          newModel.flowIndex = cv.coefficientValue;
        } else if (coefName.includes('теплоотдачи')) {
          newModel.heatTransfer = cv.coefficientValue;
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
        p: 3, 
        bgcolor: '#f5f7fa',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%)'
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
        Моделирование неизотермического течения
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <MaterialTable />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 8px 24px rgba(21,39,75,0.12)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ fontWeight: 600, color: '#1a237e', mb: 3 }}
              >
                Параметры моделирования
              </Typography>
              
              {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>{error}</Alert>}
              
              {/* Геометрические параметры канала */}
              <Typography 
                variant="h6" 
                sx={{ 
                  mt: 2, 
                  mb: 1, 
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
                    type="number"
                    value={model.width}
                    onChange={handleInputChange}
                    inputProps={{ 
                      step: 0.01,
                      min: 0
                    }}
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
                    type="number"
                    value={model.depth}
                    onChange={handleInputChange}
                    inputProps={{ 
                      step: 0.001,
                      min: 0
                    }}
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
                    type="number"
                    value={model.length}
                    onChange={handleInputChange}
                    inputProps={{ 
                      step: 0.1,
                      min: 0
                    }}
                    margin="normal"
                    variant="outlined"
                    sx={textFieldStyles}
                  />
                </Grid>
              </Grid>
              
              {/* Режимные параметры объекта */}
              <Typography 
                variant="h6" 
                sx={{ 
                  mt: 3, 
                  mb: 1, 
                  fontSize: '1.1rem', 
                  fontWeight: 500,
                  color: '#283593',
                  borderBottom: '2px solid #3f51b5',
                  paddingBottom: 1,
                  display: 'inline-block'
                }}
              >
                Режимные параметры объекта
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Скорость крышки (м/с)"
                    name="coverSpeed"
                    type="number"
                    value={model.coverSpeed}
                    onChange={handleInputChange}
                    inputProps={{ 
                      step: 0.01,
                      min: 0
                    }}
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
                    type="number"
                    value={model.coverTemp}
                    onChange={handleInputChange}
                    inputProps={{ 
                      step: 1,
                      min: 0
                    }}
                    margin="normal"
                    variant="outlined"
                    sx={textFieldStyles}
                  />
                </Grid>
              </Grid>
              
              {/* Параметры свойств объекта */}
              <Typography 
                variant="h6" 
                sx={{ 
                  mt: 3, 
                  mb: 1, 
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
                    type="number"
                    value={model.density}
                    onChange={handleInputChange}
                    inputProps={{ 
                      step: 1,
                      min: 0
                    }}
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
                    type="number"
                    value={model.heatCapacity}
                    onChange={handleInputChange}
                    inputProps={{ 
                      step: 1,
                      min: 0
                    }}
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
                    type="number"
                    value={model.glassTransitionTemp}
                    onChange={handleInputChange}
                    inputProps={{ 
                      step: 1,
                      min: 0
                    }}
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
                    type="number"
                    value={model.meltingTemp}
                    onChange={handleInputChange}
                    inputProps={{ 
                      step: 1,
                      min: 0
                    }}
                    margin="normal"
                    variant="outlined"
                    sx={textFieldStyles}
                  />
                </Grid>
              </Grid>
              
              {/* Эмпирические коэффициенты модели */}
              <Typography 
                variant="h6" 
                sx={{ 
                  mt: 3, 
                  mb: 1, 
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
                    type="number"
                    value={model.mu0}
                    onChange={handleInputChange}
                    inputProps={{ 
                      step: 10,
                      min: 0
                    }}
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
                    type="number"
                    value={model.firstConstantVLF}
                    onChange={handleInputChange}
                    inputProps={{ 
                      step: 0.01,
                      min: 0
                    }}
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
                    type="number"
                    value={model.secondConstantVLF}
                    onChange={handleInputChange}
                    inputProps={{ 
                      step: 0.1,
                      min: 0
                    }}
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
                    type="number"
                    value={model.castingTemp}
                    onChange={handleInputChange}
                    inputProps={{ 
                      step: 1,
                      min: 0
                    }}
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
                    type="number"
                    value={model.flowIndex}
                    onChange={handleInputChange}
                    inputProps={{ 
                      step: 0.01, 
                      min: 0, 
                      max: 1 
                    }}
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
                    type="number"
                    value={model.heatTransfer}
                    onChange={handleInputChange}
                    inputProps={{ 
                      step: 10,
                      min: 0
                    }}
                    margin="normal"
                    variant="outlined"
                    sx={textFieldStyles}
                  />
                </Grid>
              </Grid>
              
              {/* Параметры метода решения */}
              <Typography 
                variant="h6" 
                sx={{ 
                  mt: 3, 
                  mb: 1, 
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
                    type="number"
                    value={model.step}
                    onChange={handleInputChange}
                    inputProps={{ 
                      step: 0.001, 
                      min: 0.001 
                    }}
                    margin="normal"
                    variant="outlined"
                    sx={textFieldStyles}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Шаг отображения таблицы (м)"
                    name="displayStep"
                    type="number"
                    value={model.displayStep}
                    onChange={handleInputChange}
                    inputProps={{ 
                      step: 0.1, 
                      min: 0.1 
                    }}
                    margin="normal"
                    variant="outlined"
                    sx={textFieldStyles}
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
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
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
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
                Результаты моделирования
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
            
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  boxShadow: '0 8px 24px rgba(21,39,75,0.12)',
                  border: '1px solid rgba(63, 81, 181, 0.12)',
                  height: 400
                }}
              >
                {tempChartData && <Line options={tempChartOptions} data={tempChartData} />}
              </Paper>
              {result && (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    mt: 3, 
                    borderRadius: 2, 
                    boxShadow: '0 8px 24px rgba(21,39,75,0.12)',
                    border: '1px solid rgba(63, 81, 181, 0.12)'
                  }}
                >
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                      fontSize: '1.1rem',
                      fontWeight: 500,
                      color: '#3f51b5',
                      borderBottom: '1px solid rgba(63, 81, 181, 0.3)',
                      pb: 1,
                      mb: 2
                    }}
                  >
                    Таблица температуры
                  </Typography>
                  <TableContainer sx={{ maxHeight: 300 }}>
                    <Table size="small" sx={{ '& .MuiTableCell-root': { borderBottom: '1px solid rgba(63, 81, 181, 0.1)' } }}>
                      <TableHead>
                        <TableRow sx={{ '& .MuiTableCell-root': { fontWeight: 600, backgroundColor: 'rgba(63, 81, 181, 0.05)' } }}>
                          <TableCell>Координата по длине канала (м)</TableCell>
                          <TableCell>Температура (°C)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {prepareTableData(result.positions, result.temperatures, model.displayStep).map((row, index) => (
                          <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'rgba(63, 81, 181, 0.02)' } }}>
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
                  p: 2, 
                  borderRadius: 2, 
                  boxShadow: '0 8px 24px rgba(21,39,75,0.12)',
                  border: '1px solid rgba(63, 81, 181, 0.12)',
                  height: 400
                }}
              >
                {viscChartData && <Line options={viscChartOptions} data={viscChartData} />}
              </Paper>
              {result && (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    mt: 3, 
                    borderRadius: 2, 
                    boxShadow: '0 8px 24px rgba(21,39,75,0.12)',
                    border: '1px solid rgba(63, 81, 181, 0.12)'
                  }}
                >
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                      fontSize: '1.1rem',
                      fontWeight: 500,
                      color: '#3f51b5',
                      borderBottom: '1px solid rgba(63, 81, 181, 0.3)',
                      pb: 1,
                      mb: 2
                    }}
                  >
                    Таблица вязкости
                  </Typography>
                  <TableContainer sx={{ maxHeight: 300 }}>
                    <Table size="small" sx={{ '& .MuiTableCell-root': { borderBottom: '1px solid rgba(63, 81, 181, 0.1)' } }}>
                      <TableHead>
                        <TableRow sx={{ '& .MuiTableCell-root': { fontWeight: 600, backgroundColor: 'rgba(63, 81, 181, 0.05)' } }}>
                          <TableCell>Координата по длине канала (м)</TableCell>
                          <TableCell>Вязкость (Па·с)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {prepareTableData(result.positions, result.viscosities, model.displayStep).map((row, index) => (
                          <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'rgba(63, 81, 181, 0.02)' } }}>
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
  );
};

export default SimulationPage; 
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
  Paper
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

const SimulationPage: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultModel | null>(null);
  
  // Параметры модели расчетов
  const [model, setModel] = useState<MathModel>({
    width: 0.1,
    depth: 0.01,
    length: 1.0,
    density: 1000,
    heatCapacity: 2000,
    glassTransitionTemp: 100,
    meltingTemp: 200,
    coverSpeed: 0.1,
    coverTemp: 150,
    mu0: 10000,
    firstConstantVLF: 8.86,
    secondConstantVLF: 101.6,
    castingTemp: 190,
    flowIndex: 0.3,
    heatTransfer: 1000,
    step: 0.01
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
    setModel({
      ...model,
      [name]: parseFloat(value)
    });
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
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Распределение температуры по длине канала',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Позиция (м)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Температура (°C)'
        }
      }
    }
  };

  const viscChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Распределение вязкости по длине канала',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Позиция (м)'
        }
      },
      y: {
        title: {
          display: true, 
          text: 'Вязкость (Па·с)'
        }
      }
    }
  };

  // Данные для графиков
  const tempChartData = result ? {
    labels: result.positions.map(p => p.toFixed(3)),
    datasets: [
      {
        label: 'Температура',
        data: result.temperatures,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      }
    ],
  } : null;

  const viscChartData = result ? {
    labels: result.positions.map(p => p.toFixed(3)),
    datasets: [
      {
        label: 'Вязкость',
        data: result.viscosities,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      }
    ],
  } : null;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Моделирование неизотермического течения
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <MaterialTable />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Параметры моделирования
              </Typography>
              
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Ширина канала (м)"
                    name="width"
                    type="number"
                    value={model.width}
                    onChange={handleInputChange}
                    inputProps={{ step: 0.01 }}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Глубина канала (м)"
                    name="depth"
                    type="number"
                    value={model.depth}
                    onChange={handleInputChange}
                    inputProps={{ step: 0.001 }}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Длина канала (м)"
                    name="length"
                    type="number"
                    value={model.length}
                    onChange={handleInputChange}
                    inputProps={{ step: 0.1 }}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Плотность (кг/м³)"
                    name="density"
                    type="number"
                    value={model.density}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Удельная теплоемкость (Дж/(кг·°C))"
                    name="heatCapacity"
                    type="number"
                    value={model.heatCapacity}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Температура стеклования (°С)"
                    name="glassTransitionTemp"
                    type="number"
                    value={model.glassTransitionTemp}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Температура плавления (°C)"
                    name="meltingTemp"
                    type="number"
                    value={model.meltingTemp}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Скорость крышки (м/с)"
                    name="coverSpeed"
                    type="number"
                    value={model.coverSpeed}
                    onChange={handleInputChange}
                    inputProps={{ step: 0.01 }}
                    margin="normal"
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
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Коэффициент консистенции (Па·с^n)"
                    name="mu0"
                    type="number"
                    value={model.mu0}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Первая константа ВЛФ"
                    name="firstConstantVLF"
                    type="number"
                    value={model.firstConstantVLF}
                    onChange={handleInputChange}
                    inputProps={{ step: 0.01 }}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Вторая константа ВЛФ (°С)"
                    name="secondConstantVLF"
                    type="number"
                    value={model.secondConstantVLF}
                    onChange={handleInputChange}
                    inputProps={{ step: 0.1 }}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Температура приведения (°C)"
                    name="castingTemp"
                    type="number"
                    value={model.castingTemp}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Индекс течения"
                    name="flowIndex"
                    type="number"
                    value={model.flowIndex}
                    onChange={handleInputChange}
                    inputProps={{ step: 0.01, min: 0, max: 1 }}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Коэффициент теплоотдачи (Вт/(м²·°C))"
                    name="heatTransfer"
                    type="number"
                    value={model.heatTransfer}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Шаг расчета (м)"
                    name="step"
                    type="number"
                    value={model.step}
                    onChange={handleInputChange}
                    inputProps={{ step: 0.001, min: 0.001 }}
                    margin="normal"
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleRunSimulation}
                  disabled={loading}
                  size="large"
                  sx={{ minWidth: 200 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Рассчитать'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {result && (
          <>
            <Grid item xs={12}>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h5" gutterBottom>
                Результаты моделирования
              </Typography>
              <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body1">
                      <strong>Производительность:</strong> {result.productivity.toFixed(2)} кг/ч
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body1">
                      <strong>Конечная температура:</strong> {result.finalTemperature.toFixed(2)} °C
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body1">
                      <strong>Конечная вязкость:</strong> {result.finalViscosity.toFixed(2)} Па·с
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body1">
                      <strong>Форм-фактор:</strong> {result.shapeFactor.toFixed(5)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body1">
                      <strong>Объемный расход:</strong> {result.volumetricFlowRate.toExponential(3)} м³/с
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body1">
                      <strong>Скорость сдвига:</strong> {result.shearRate.toFixed(2)} 1/с
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2 }}>
                {tempChartData && <Line options={tempChartOptions} data={tempChartData} />}
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2 }}>
                {viscChartData && <Line options={viscChartOptions} data={viscChartData} />}
              </Paper>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default SimulationPage; 
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
import * as XLSX from 'xlsx';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);


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


const prepareTableData = (positions: number[], values: number[], displayStep: number) => {
  const result = [];
  // Если displayStep равен 0, показываем все точки
  const step = displayStep === 0 ? 1 : displayStep + 1;
  
  for (let i = 0; i < positions.length; i += step) {
    result.push({
      position: positions[i],
      value: values[i]
    });
  }
  
  // Всегда добавляем последнюю точку, если она еще не добавлена
  if (positions.length > 0 && result[result.length - 1]?.position !== positions[positions.length - 1]) {
    result.push({
      position: positions[positions.length - 1],
      value: values[values.length - 1]
    });
  }
  return result;
};

// Добавляем интерфейс для ошибок полей
interface FieldErrors {
  [key: string]: string;
}

const SimulationPage: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultModel | null>(null);
  const [clientPerformance, setClientPerformance] = useState<{
    renderTime: number;
    memoryUsage: number;
  }>({ renderTime: 0, memoryUsage: 0 });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  
  // Параметры модели расчетов
  const [model, setModel] = useState<MathModel>({
    width: 0.2,
    depth: 0.01,
    length: 8.0,
    density: 0,
    heatCapacity: 0,
    glassTransitionTemp: 0,
    meltingTemp: 0,
    coverSpeed: 0.9,
    coverTemp: 280,
    mu0: 0,
    firstConstantVLF: 0,
    secondConstantVLF: 0,
    castingTemp: 0,
    flowIndex: 0,
    heatTransfer: 0,
    step: 0.01,
    displayStep: 0
  });

  // Загрузка материалов при загрузке компонента
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const data = await getAllMaterials();
        setMaterials(data);
        
        // Автоматический выбор поликарбоната
        const polycarbonate = data.find(m => m.name.toLowerCase().includes('поликарбонат'));
        if (polycarbonate) {
          const material = await getMaterialById(polycarbonate.id);
          setSelectedMaterial(material);
          
          // Создаем новую модель на основе текущей
          const newModel = { ...model };
          
          // Применяем свойства материала
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

          // Применяем коэффициенты материала
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
        }
      } catch (err) {
        console.error('Ошибка при загрузке материалов:', err);
        setError('Ошибка при загрузке материалов');
      }
    };

    fetchMaterials();
  }, []);

  // Обработчик изменения полей ввода
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    
    // Функция для обновления ошибок полей
    const updateFieldError = (fieldName: string, errorMessage: string | null) => {
      setFieldErrors(prev => {
        if (errorMessage === null) {
          const { [fieldName]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [fieldName]: errorMessage };
      });
    };
    
    // Для количества пропусков шагов разрешаем только целые неотрицательные числа
    if (name === 'displayStep') {
      if (value === '') {
        setModel(prevModel => ({
          ...prevModel,
          [name]: 0
        }));
        updateFieldError(name, null);
        setError(null);
        return;
      }
      
      const numValue = Number(value);
      if (!Number.isInteger(numValue) || numValue < 0) {
        updateFieldError(name, 'Должно быть целым неотрицательным числом');
        setError('Количество пропусков шагов должно быть целым неотрицательным числом');
        return;
      }
      
      setModel(prevModel => ({
        ...prevModel,
        [name]: numValue
      }));
      updateFieldError(name, null);
      setError(null);
      return;
    }
    
    // Для остальных полей разрешаем положительные числа и десятичные дроби
    if (value === '' || value === '.' || value === ',') {
      setModel(prevModel => ({
        ...prevModel,
        [name]: value
      }));
      updateFieldError(name, null);
      setError(null);
      return;
    }

    // Заменяем запятую на точку для корректного преобразования
    const normalizedValue = value.replace(',', '.');
    
    // Проверяем, что это допустимое положительное число или десятичная дробь
    if (!/^\d*\.?\d*$/.test(normalizedValue) || Number(normalizedValue) < 0) {
      updateFieldError(name, 'Должно быть положительным числом');
      setError('Значение должно быть положительным числом');
      return;
    }

    setModel(prevModel => ({
      ...prevModel,
      [name]: normalizedValue
    }));
    updateFieldError(name, null);
    setError(null);
  };

  // Функция валидации поля
  const validateField = (name: string, value: any): string | null => {
    // Преобразуем значение в строку для проверки
    const strValue = String(value);
    
    // Если поле пустое
    if (strValue === '' || strValue === '.' || strValue === ',') {
      return 'Поле обязательно для заполнения';
    }

    // Для поля количества пропусков шагов
    if (name === 'displayStep') {
      const numValue = Number(strValue);
      if (!Number.isInteger(numValue) || numValue < 0) {
        return 'Должно быть целым неотрицательным числом';
      }
      return null;
    }

    // Для всех остальных числовых полей
    const normalizedValue = strValue.replace(',', '.');
    if (!/^\d*\.?\d*$/.test(normalizedValue) || Number(normalizedValue) <= 0) {
      return 'Должно быть положительным числом';
    }

    return null;
  };

  // Функция валидации всех полей
  const validateAllFields = (): boolean => {
    const newFieldErrors: FieldErrors = {};
    let hasErrors = false;

    // Проверяем все поля модели
    Object.entries(model).forEach(([fieldName, value]) => {
      const error = validateField(fieldName, value);
      if (error) {
        newFieldErrors[fieldName] = error;
        hasErrors = true;
      }
    });

    setFieldErrors(newFieldErrors);
    if (hasErrors) {
      setError('Пожалуйста, исправьте ошибки в полях ввода');
    }
    return !hasErrors;
  };

  // Обновляем обработчик запуска симуляции
  const handleRunSimulation = async () => {
    // Сначала проверяем все поля
    if (!validateAllFields()) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Преобразуем все числовые значения
      const normalizedModel: MathModel = {
        ...model,
        width: Number(String(model.width).replace(',', '.')),
        depth: Number(String(model.depth).replace(',', '.')),
        length: Number(String(model.length).replace(',', '.')),
        density: Number(String(model.density).replace(',', '.')),
        heatCapacity: Number(String(model.heatCapacity).replace(',', '.')),
        glassTransitionTemp: Number(String(model.glassTransitionTemp).replace(',', '.')),
        meltingTemp: Number(String(model.meltingTemp).replace(',', '.')),
        coverSpeed: Number(String(model.coverSpeed).replace(',', '.')),
        coverTemp: Number(String(model.coverTemp).replace(',', '.')),
        mu0: Number(String(model.mu0).replace(',', '.')),
        firstConstantVLF: Number(String(model.firstConstantVLF).replace(',', '.')),
        secondConstantVLF: Number(String(model.secondConstantVLF).replace(',', '.')),
        castingTemp: Number(String(model.castingTemp).replace(',', '.')),
        flowIndex: Number(String(model.flowIndex).replace(',', '.')),
        heatTransfer: Number(String(model.heatTransfer).replace(',', '.')),
        step: Number(String(model.step).replace(',', '.')),
        displayStep: Number(model.displayStep)
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

  // Функция для форматирования размера памяти в МБ
  const formatMemoryToMB = (bytes: number): number => {
    return Number((bytes / (1024 * 1024)).toFixed(2));
  };

  // Экспорт результатов в Excel
  const handleExportToExcel = () => {
    if (!result || !selectedMaterial) return;

    const workbook = XLSX.utils.book_new();
    
    // Подготовка данных для листа с исходными данными
    const inputData = [
      { 'Параметр': 'Тип материала', 'Значение': `${selectedMaterial.name} (${selectedMaterial.materialType})` },
      { 'Параметр': '', 'Значение': '' },
      { 'Параметр': 'Варьируемые (режимные) параметры процесса', 'Значение': '' },
      { 'Параметр': 'Скорость крышки (м/с)', 'Значение': model.coverSpeed },
      { 'Параметр': 'Температура крышки (°C)', 'Значение': model.coverTemp },
      { 'Параметр': '', 'Значение': '' },
      { 'Параметр': 'Геометрические параметры канала', 'Значение': '' },
      { 'Параметр': 'Ширина канала (м)', 'Значение': model.width },
      { 'Параметр': 'Глубина канала (м)', 'Значение': model.depth },
      { 'Параметр': 'Длина канала (м)', 'Значение': model.length },
      { 'Параметр': '', 'Значение': '' },
      { 'Параметр': 'Параметры свойств материала', 'Значение': '' },
      { 'Параметр': 'Плотность (кг/м³)', 'Значение': model.density },
      { 'Параметр': 'Удельная теплоемкость (Дж/(кг·°C))', 'Значение': model.heatCapacity },
      { 'Параметр': 'Температура стеклования (°С)', 'Значение': model.glassTransitionTemp },
      { 'Параметр': 'Температура плавления (°C)', 'Значение': model.meltingTemp },
      { 'Параметр': '', 'Значение': '' },
      { 'Параметр': 'Эмпирические коэффициенты модели', 'Значение': '' },
      { 'Параметр': 'Коэффициент консистенции (Па·с^n)', 'Значение': model.mu0 },
      { 'Параметр': 'Первая константа ВЛФ', 'Значение': model.firstConstantVLF },
      { 'Параметр': 'Вторая константа ВЛФ (°С)', 'Значение': model.secondConstantVLF },
      { 'Параметр': 'Температура приведения (°C)', 'Значение': model.castingTemp },
      { 'Параметр': 'Индекс течения', 'Значение': model.flowIndex },
      { 'Параметр': 'Коэффициент теплоотдачи (Вт/(м²·°C))', 'Значение': model.heatTransfer },
      { 'Параметр': '', 'Значение': '' },
      { 'Параметр': 'Параметры метода решения', 'Значение': '' },
      { 'Параметр': 'Шаг расчета (м)', 'Значение': model.step },
      { 'Параметр': 'Количество пропусков шагов', 'Значение': model.displayStep }
    ];

    // Создание листа с исходными данными
    const inputSheet = XLSX.utils.json_to_sheet(inputData);
    XLSX.utils.book_append_sheet(workbook, inputSheet, 'Исходные данные');
    
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
    const totalPerformance = getTotalPerformance();
    const performanceData = [
      { 'Показатель': 'Показатели экономичности', 'Значение': '' },
      { 'Показатель': 'Общая производительность (кг/ч)', 'Значение': result.productivity },
      { 'Показатель': 'Общая температура продукта (°C)', 'Значение': result.finalTemperature },
      { 'Показатель': 'Общая вязкость продукта (Па·с)', 'Значение': result.finalViscosity },
      { 'Показатель': '', 'Значение': '' },
      { 'Показатель': 'Показатели производительности', 'Значение': '' },
      { 'Показатель': 'Общее время расчета (мс)', 'Значение': totalPerformance.totalTime.toFixed(2) },
      { 'Показатель': 'Время расчета на сервере (мс)', 'Значение': result.calculationTime },
      { 'Показатель': 'Время визуализации на клиенте (мс)', 'Значение': Number(clientPerformance.renderTime.toFixed(2)) },
      { 'Показатель': '', 'Значение': '' },
      { 'Показатель': 'Общая память (МБ)', 'Значение': formatMemoryToMB(totalPerformance.totalMemory) },
      { 'Показатель': 'Память сервера (МБ)', 'Значение': formatMemoryToMB(result.memoryUsage) },
      { 'Показатель': 'Память клиента (МБ)', 'Значение': formatMemoryToMB(clientPerformance.memoryUsage) },
      { 'Показатель': '', 'Значение': '' },
      { 'Показатель': 'Количество операций', 'Значение': result.operationsCount }
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
      
      // Создаем новую модель на основе текущей
      const newModel = { ...model };
      
      // Применяем свойства материала
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

      // Применяем коэффициенты материала
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
    } catch (err) {
      console.error('Ошибка при загрузке материала:', err);
      setError('Ошибка при загрузке материала');
    }
  };

  // Модифицируем стили для текстовых полей с учетом ошибок
  const getTextFieldStyles = (fieldName: string) => ({
    ...textFieldStyles,
    '& .MuiOutlinedInput-root': {
      ...textFieldStyles['& .MuiOutlinedInput-root'],
      '& fieldset': {
        borderColor: fieldErrors[fieldName] ? '#d32f2f' : 'rgba(0, 0, 0, 0.23)',
      },
      '&:hover fieldset': {
        borderColor: fieldErrors[fieldName] ? '#d32f2f' : '#3f51b5',
      },
      '&.Mui-focused fieldset': {
        borderColor: fieldErrors[fieldName] ? '#d32f2f' : '#3f51b5',
      },
    },
    '& .MuiInputLabel-root': {
      color: fieldErrors[fieldName] ? '#d32f2f' : 'rgba(0, 0, 0, 0.6)',
      '&.Mui-focused': {
        color: fieldErrors[fieldName] ? '#d32f2f' : '#3f51b5',
      },
    },
  });

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

  // Функция для измерения производительности клиента
  const measureClientPerformance = () => {
    const startTime = performance.now();
    
    // Получаем текущее использование памяти
    const memory = (performance as any).memory?.usedJSHeapSize || 0;
    
    // Устанавливаем таймер на конец отрисовки
    requestAnimationFrame(() => {
      const endTime = performance.now();
      setClientPerformance({
        renderTime: endTime - startTime,
        memoryUsage: memory
      });
    });
  };

  // Вызываем измерение при получении результатов
  useEffect(() => {
    if (result) {
      measureClientPerformance();
    }
  }, [result]);

  // Функция для получения общих показателей производительности
  const getTotalPerformance = () => {
    if (!result) return { totalTime: 0, totalMemory: 0 };
    return {
      totalTime: result.calculationTime + clientPerformance.renderTime,
      totalMemory: result.memoryUsage + clientPerformance.memoryUsage
    };
  };

  return (
    <Box 
      sx={{ 
        p: 4,
        px: { xs: 2, sm: 4, md: 6, lg: 8 },
        bgcolor: '#f5f7fa',
        minHeight: '100vh',
        width: '100vw',
        position: 'relative',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%)',
        maxWidth: 'none'
      }}
    >
      <Box
        sx={{
          width: '100%',
          margin: '0 auto',
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
                  Варьируемые (Режимные) параметры процесса
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
                      error={!!fieldErrors.coverSpeed}
                      helperText={fieldErrors.coverSpeed}
                      sx={getTextFieldStyles('coverSpeed')}
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
                      error={!!fieldErrors.coverTemp}
                      helperText={fieldErrors.coverTemp}
                      sx={getTextFieldStyles('coverTemp')}
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
                        error={!!fieldErrors.width}
                        helperText={fieldErrors.width}
                        sx={getTextFieldStyles('width')}
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
                        error={!!fieldErrors.depth}
                        helperText={fieldErrors.depth}
                        sx={getTextFieldStyles('depth')}
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
                        error={!!fieldErrors.length}
                        helperText={fieldErrors.length}
                        sx={getTextFieldStyles('length')}
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
                    Параметры свойств материала
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
                        error={!!fieldErrors.density}
                        helperText={fieldErrors.density}
                        sx={getTextFieldStyles('density')}
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
                        error={!!fieldErrors.heatCapacity}
                        helperText={fieldErrors.heatCapacity}
                        sx={getTextFieldStyles('heatCapacity')}
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
                        error={!!fieldErrors.glassTransitionTemp}
                        helperText={fieldErrors.glassTransitionTemp}
                        sx={getTextFieldStyles('glassTransitionTemp')}
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
                        error={!!fieldErrors.meltingTemp}
                        helperText={fieldErrors.meltingTemp}
                        sx={getTextFieldStyles('meltingTemp')}
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
                        error={!!fieldErrors.mu0}
                        helperText={fieldErrors.mu0}
                        sx={getTextFieldStyles('mu0')}
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
                        error={!!fieldErrors.firstConstantVLF}
                        helperText={fieldErrors.firstConstantVLF}
                        sx={getTextFieldStyles('firstConstantVLF')}
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
                        error={!!fieldErrors.secondConstantVLF}
                        helperText={fieldErrors.secondConstantVLF}
                        sx={getTextFieldStyles('secondConstantVLF')}
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
                        error={!!fieldErrors.castingTemp}
                        helperText={fieldErrors.castingTemp}
                        sx={getTextFieldStyles('castingTemp')}
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
                        error={!!fieldErrors.flowIndex}
                        helperText={fieldErrors.flowIndex}
                        sx={getTextFieldStyles('flowIndex')}
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
                        error={!!fieldErrors.heatTransfer}
                        helperText={fieldErrors.heatTransfer}
                        sx={getTextFieldStyles('heatTransfer')}
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
                        error={!!fieldErrors.step}
                        helperText={fieldErrors.step}
                        sx={getTextFieldStyles('step')}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Количество пропусков шагов при выводе в таблицу"
                        name="displayStep"
                        type="number"
                        inputProps={{ min: 0, step: 1 }}
                        value={model.displayStep}
                        onChange={handleInputChange}
                        error={!!fieldErrors.displayStep}
                        helperText={fieldErrors.displayStep || '0 - без пропусков, 1 - пропуск одной строки, и т.д.'}
                        margin="normal"
                        variant="outlined"
                        sx={getTextFieldStyles('displayStep')}
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
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 2, 
                    boxShadow: '0 8px 24px rgba(21,39,75,0.12)',
                    border: '1px solid rgba(63, 81, 181, 0.12)',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f5f7ff 100%)'
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
                    Показатели экономичности
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body1">
                        <strong style={{ color: '#3f51b5' }}>Производительность:</strong> {result.productivity.toFixed(2)} кг/ч
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body1">
                        <strong style={{ color: '#3f51b5' }}>Температура продукта:</strong> {result.finalTemperature.toFixed(2)} °C
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body1">
                        <strong style={{ color: '#3f51b5' }}>Вязкость продукта:</strong> {result.finalViscosity.toFixed(1)} Па·с
                      </Typography>
                    </Grid>
                  </Grid>
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
                  {tempChartData && <Line options={tempChartOptions} data={tempChartData} />}
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
                  {viscChartData && <Line options={viscChartOptions} data={viscChartData} />}
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 4,
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
                    Результаты расчета
                  </Typography>
                  <TableContainer sx={{ maxHeight: 600 }}>
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
                          <TableCell>Вязкость (Па·с)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {prepareTableData(result.positions, result.temperatures, model.displayStep).map((row, index) => (
                          <TableRow 
                            key={`data-${index}`}
                            sx={{ 
                              '&:nth-of-type(odd)': { backgroundColor: 'rgba(63, 81, 181, 0.02)' },
                              '&:hover': { backgroundColor: 'rgba(63, 81, 181, 0.05)' }
                            }}
                          >
                            <TableCell>{row.position.toFixed(3)}</TableCell>
                            <TableCell>{result.temperatures[index].toFixed(2)}</TableCell>
                            <TableCell>{result.viscosities[index].toFixed(1)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
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
                    Показатели производительности
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body1">
                        <strong style={{ color: '#3f51b5' }}>Общее время расчета:</strong> {getTotalPerformance().totalTime.toFixed(2)} мс
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                        Сервер: {result.calculationTime.toFixed(2)} мс<br/>
                        Клиент: {clientPerformance.renderTime.toFixed(2)} мс
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body1">
                        <strong style={{ color: '#3f51b5' }}>Общая память:</strong> {formatMemoryToMB(getTotalPerformance().totalMemory)} МБ
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                        Сервер: {formatMemoryToMB(result.memoryUsage)} МБ<br/>
                        Клиент: {formatMemoryToMB(clientPerformance.memoryUsage)} МБ
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body1">
                        <strong style={{ color: '#3f51b5' }}>Количество операций:</strong> {result.operationsCount.toLocaleString()}
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
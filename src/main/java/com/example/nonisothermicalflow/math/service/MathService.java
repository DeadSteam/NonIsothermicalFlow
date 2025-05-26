package com.example.nonisothermicalflow.math.service;

import com.example.nonisothermicalflow.math.model.MathModel;
import com.example.nonisothermicalflow.math.model.ResultModel;
import org.springframework.stereotype.Service;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.MemoryUsage;
import java.util.ArrayList;
import java.util.List;

@Service
public class MathService {
    
    /**
     * Выполняет моделирование неизотермического течения с заданными параметрами
     * 
     * @param model Модель с входными параметрами
     * @return ResultModel с результатами расчетов
     */
    public ResultModel runSimulation(MathModel model) {
        // Выполняем расчеты и возвращаем результаты
        return calculateSimulationResults(model);
    }
    
    /**
     * Выполняет расчет модели неизотермического течения на основе входных параметров
     * @param model Математическая модель с входными параметрами
     * @return Результаты моделирования
     */
    private ResultModel calculateSimulationResults(MathModel model) {
        // Счетчик математических операций
        long operationsCount = 0;
        
        // Запустим сборщик мусора перед измерениями
        System.gc();
        
        // Получаем доступ к данным о памяти через MXBean API
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        MemoryUsage heapUsageBefore = memoryBean.getHeapMemoryUsage();
        MemoryUsage nonHeapUsageBefore = memoryBean.getNonHeapMemoryUsage();
        
        // Начальное время расчета
        long startTime = System.currentTimeMillis();
        
        // 1. Расчет начальных параметров
        // Расчет коэффициента формы канала
        double F = 0.125 * Math.pow(model.getDepth()/model.getWidth(), 2) - 0.625 * (model.getDepth()/model.getWidth()) + 1;
        operationsCount += 6; // деление, возведение в степень, умножение, вычитание, сложение
        
        // Расчет объемного расхода
        double QCH = (model.getDepth() * model.getWidth() * model.getCoverSpeed() / 2) * F;
        operationsCount += 4; // умножение * 3, деление
        
        double gamma = model.getCoverSpeed() / model.getDepth();
        operationsCount += 1; // деление
        
        // Расчет вязкостного тепловыделения
        double qGamma = model.getDepth() * model.getWidth() * model.getMu0() * Math.pow(gamma, model.getFlowIndex() + 1);
        operationsCount += 4; // умножение * 3, сложение, возведение в степень
        
        // Расчет теплового потока
        double qAlpha = model.getWidth() * model.getHeatTransfer() * model.getCoverTemp();
        operationsCount += 2; // умножение * 2
        
        double averageTemp = (model.getMeltingTemp() + (model.getGlassTransitionTemp() + 100)) / 2;
        operationsCount += 3; // сложение * 2, деление
        
        double C2 = model.getSecondConstantVLF() + model.getCastingTemp() - model.getGlassTransitionTemp();
        operationsCount += 2; // сложение, вычитание
        
        double C1 = (model.getFirstConstantVLF() * model.getSecondConstantVLF()) / C2;
        operationsCount += 2; // умножение, деление
        
        double b = C1 / (C2 + (averageTemp - model.getCastingTemp()));
        operationsCount += 3; // вычитание, сложение, деление
        
        int stepsCount = (int) Math.round(model.getLength() / model.getStep());
        operationsCount += 2; // деление, округление

        // 2. Подготовка списков для результатов
        List<Double> positions = new ArrayList<>();
        List<Double> temperatures = new ArrayList<>();
        List<Double> viscosities = new ArrayList<>();

        // 3. Основной цикл расчета по длине канала
        for (int i = 0; i <= stepsCount; i++) {
            double z = i * model.getStep();
            positions.add(z);
            operationsCount += 1; // умножение

            double numerator1 = b * qGamma + model.getWidth() * model.getHeatTransfer();
            operationsCount += 3; // умножение * 2, сложение
            
            double denominator1 = model.getWidth() * (1 + b * model.getCastingTemp()) * model.getHeatTransfer() - b * qAlpha;
            operationsCount += 5; // умножение * 4, вычитание, сложение
            
            double exp1 = Math.exp(-denominator1 * z / (model.getDensity() * model.getHeatCapacity() * QCH));
            operationsCount += 5; // умножение * 3, деление, вычисление exp
            
            double part1 = (numerator1 / denominator1) * (1 - exp1);
            operationsCount += 3; // деление, вычитание, умножение
            
            double numerator2 = model.getWidth() * ((1 / b + model.getCastingTemp()) * model.getHeatTransfer() - qAlpha) * z;
            operationsCount += 6; // деление, сложение, умножение * 3, вычитание
            
            double denominator2 = model.getDensity() * model.getHeatCapacity() * QCH;
            operationsCount += 2; // умножение * 2
            
            double exp2 = Math.exp(b * (model.getMeltingTemp() - model.getCastingTemp() - (numerator2 / denominator2)));
            operationsCount += 6; // вычитание * 2, деление, умножение, вычисление exp
            
            double chi = part1 + exp2;
            operationsCount += 1; // сложение
            
            // Расчет температуры
            double temperature = model.getCastingTemp() + (1 / b) * Math.log(chi);
            temperatures.add(temperature);
            operationsCount += 4; // деление, вычисление log, умножение, сложение
            
            // Расчет вязкости
            double viscosity = model.getMu0() * Math.exp(-b * (temperature - model.getCastingTemp())) * Math.pow(gamma, model.getFlowIndex() - 1);
            viscosities.add(viscosity);
            operationsCount += 6; // вычитание * 2, умножение * 2, вычисление exp, возведение в степень
        }

        // 4. Расчет итоговых показателей
        // Расчет производительности
        double productivity = 3600 * model.getDensity() * QCH; // кг/ч
        operationsCount += 2; // умножение * 2
        
        double finalTemp = temperatures.get(temperatures.size() - 1);
        double finalViscosity = viscosities.get(viscosities.size() - 1);
        
        // Завершение измерения времени расчета
        long calculationTime = System.currentTimeMillis() - startTime;
        
        // Очищаем память
        System.gc();
        
        MemoryUsage heapUsageAfter = memoryBean.getHeapMemoryUsage();
        MemoryUsage nonHeapUsageAfter = memoryBean.getNonHeapMemoryUsage();
        
        // Вычисляем разницу в используемой памяти (heap + non-heap)
        long heapUsed = Math.max(0, heapUsageAfter.getUsed() - heapUsageBefore.getUsed());
        long nonHeapUsed = Math.max(0, nonHeapUsageAfter.getUsed() - nonHeapUsageBefore.getUsed());
        
        // Общее использование памяти
        long memoryUsage = heapUsed + nonHeapUsed;
        
        // Если по какой-то причине получили отрицательное значение, установим минимальное положительное
        if (memoryUsage <= 0) {
            memoryUsage = positions.size() * 8 + temperatures.size() * 8 + viscosities.size() * 8;
            // Минимально гарантированный размер, основанный на количестве элементов в списках (8 байт на Double)
        }

        return new ResultModel(positions, temperatures, viscosities,
                productivity, finalTemp, finalViscosity,
                calculationTime, operationsCount, memoryUsage);
    }
    
    /**
     * Валидирует входные параметры модели
     */
    public boolean validateParameters(MathModel model) {
        return model.getWidth() > 0 && 
               model.getDepth() > 0 && 
               model.getLength() > 0 && 
               model.getCoverSpeed() > 0 && 
               model.getCoverTemp() > 0;
    }
}

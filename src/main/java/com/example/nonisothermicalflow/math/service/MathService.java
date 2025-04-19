package com.example.nonisothermicalflow.math.service;

import com.example.nonisothermicalflow.math.model.MathModel;
import com.example.nonisothermicalflow.math.model.ResultModel;
import org.springframework.stereotype.Service;

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
        // 1. Расчет начальных параметров
        // Расчет коэффициента формы канала
        double F = 0.125 * Math.pow(model.getDepth()/model.getWidth(), 2) - 0.625 * (model.getDepth()/model.getWidth()) + 1;
        
        // Расчет объемного расхода
        double QCH = (model.getDepth() * model.getWidth() * model.getCoverSpeed() / 2) * F;
        
        double gamma = model.getCoverSpeed() / model.getDepth();
        
        // Расчет вязкостного тепловыделения
        double qGamma = model.getDepth() * model.getWidth() * model.getMu0() * Math.pow(gamma, model.getFlowIndex() + 1);
        
        // Расчет теплового потока
        double qAlpha = model.getWidth() * model.getHeatTransfer() * model.getCoverTemp();
        
        double averageTemp = (model.getMeltingTemp() + (model.getGlassTransitionTemp() + 100)) / 2;
        double C2 = model.getSecondConstantVLF() + model.getCastingTemp() - model.getGlassTransitionTemp();
        double C1 = (model.getFirstConstantVLF() * model.getSecondConstantVLF()) / C2;
        double b = C1 / (C2 + (averageTemp - model.getCastingTemp()));
        int stepsCount = (int) Math.round(model.getLength() / model.getStep());

        // 2. Подготовка списков для результатов
        List<Double> positions = new ArrayList<>();
        List<Double> temperatures = new ArrayList<>();
        List<Double> viscosities = new ArrayList<>();

        // 3. Основной цикл расчета по длине канала
        for (int i = 0; i <= stepsCount; i++) {
            double z = i * model.getStep();
            positions.add(z);

            double numerator1 = b * qGamma + model.getWidth() * model.getHeatTransfer();
            double denominator1 = model.getWidth() * (1 + b * model.getCastingTemp()) * model.getHeatTransfer() - b * qAlpha;
            double exp1 = Math.exp(-denominator1 * z / (model.getDensity() * model.getHeatCapacity() * QCH));

            double part1 = (numerator1 / denominator1) * (1 - exp1);

            double numerator2 = model.getWidth() * ((1 / b + model.getCastingTemp()) * model.getHeatTransfer() - qAlpha) * z;
            double denominator2 = model.getDensity() * model.getHeatCapacity() * QCH;
            double exp2 = Math.exp(b * (model.getMeltingTemp() - model.getCastingTemp() - (numerator2 / denominator2)));

            double chi = part1 + exp2;

            // Расчет температуры
            double temperature = model.getCastingTemp() + (1 / b) * Math.log(chi);
            temperatures.add(temperature);

            // Расчет вязкости
            double viscosity = model.getMu0() * Math.exp(-b * (temperature - model.getCastingTemp())) * Math.pow(gamma, model.getFlowIndex() - 1);
            viscosities.add(viscosity);
        }

        // 4. Расчет итоговых показателей
        // Расчет производительности
        double productivity = 3600 * model.getDensity() * QCH; // кг/ч
        
        double finalTemp = temperatures.get(temperatures.size() - 1);
        double finalViscosity = viscosities.get(viscosities.size() - 1);

        return new ResultModel(F, QCH, gamma, qGamma, qAlpha, stepsCount,
                positions, temperatures, viscosities,
                productivity, finalTemp, finalViscosity);
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

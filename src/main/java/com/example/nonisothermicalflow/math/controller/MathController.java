package com.example.nonisothermicalflow.math.controller;

import com.example.nonisothermicalflow.math.model.MathModel;
import com.example.nonisothermicalflow.math.model.ResultModel;
import com.example.nonisothermicalflow.math.service.MathService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/**
 * Контроллер для API моделирования неизотермического течения
 */
@RestController
@RequestMapping("/api/math")
public class MathController {

    private final MathService mathService;

    @Autowired
    public MathController(MathService mathService) {
        this.mathService = mathService;
    }

    /**
     * Эндпойнт для выполнения моделирования
     * 
     * @param model модель с параметрами для моделирования
     * @return результаты моделирования
     */
    @PostMapping("/simulation")
    public ResponseEntity<ResultModel> runSimulation(@RequestBody MathModel model) {
        // Валидация входных параметров
        if (!mathService.validateParameters(model)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Некорректные параметры модели");
        }

        try {
            // Запуск расчетов через сервис
            ResultModel result = mathService.runSimulation(model);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Ошибка при выполнении расчетов: " + e.getMessage());
        }
    }
} 
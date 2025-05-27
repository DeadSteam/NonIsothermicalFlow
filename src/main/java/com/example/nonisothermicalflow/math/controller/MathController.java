package com.example.nonisothermicalflow.math.controller;

import com.example.nonisothermicalflow.math.model.MathModel;
import com.example.nonisothermicalflow.math.model.ResultModel;
import com.example.nonisothermicalflow.math.service.MathService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/**
 * Контроллер для API моделирования неизотермического течения
 */
@RestController
@RequestMapping("/api/v1/math")
@RequiredArgsConstructor
public class MathController {

    private final MathService mathService;

    /**
     * Выполнение моделирования неизотермического течения
     *
     * @param model модель с параметрами для моделирования
     * @return результаты моделирования
     */
    @PostMapping("/simulation")
    public ResponseEntity<ResultModel> runSimulation(@RequestBody MathModel model) {
        try {
            // Валидация входных параметров
            if (!mathService.validateParameters(model)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Некорректные параметры модели");
            }

            // Запуск расчетов через сервис
            ResultModel result = mathService.runSimulation(model);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Ошибка при выполнении расчетов: " + e.getMessage());
        }
    }
} 
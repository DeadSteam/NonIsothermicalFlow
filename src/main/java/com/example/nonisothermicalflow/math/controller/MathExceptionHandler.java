package com.example.nonisothermicalflow.math.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Глобальный обработчик исключений для контроллеров математических API
 */
@ControllerAdvice
public class MathExceptionHandler {

    /**
     * Обрабатывает исключение ResponseStatusException, вызванное контроллерами
     * 
     * @param ex исключение с HTTP-статусом
     * @return ResponseEntity с сообщением об ошибке и статусом
     */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatusException(ResponseStatusException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("status", ex.getStatusCode().value());
        body.put("error", ex.getStatusCode().toString());
        body.put("message", ex.getReason());
        body.put("timestamp", LocalDateTime.now());
        
        return new ResponseEntity<>(body, ex.getStatusCode());
    }
    
    /**
     * Обрабатывает исключение ArithmeticException, которое может возникнуть при математических расчетах
     * 
     * @param ex исключение при математических операциях
     * @return ResponseEntity с сообщением об ошибке и статусом BAD_REQUEST
     */
    @ExceptionHandler(ArithmeticException.class)
    public ResponseEntity<Map<String, Object>> handleArithmeticException(ArithmeticException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Ошибка математической операции");
        body.put("message", ex.getMessage());
        body.put("timestamp", LocalDateTime.now());
        
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }
    
    /**
     * Обрабатывает любые другие исключения, не перехваченные другими обработчиками
     * 
     * @param ex любое исключение
     * @return ResponseEntity с сообщением об ошибке и статусом INTERNAL_SERVER_ERROR
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        body.put("error", "Внутренняя ошибка сервера");
        body.put("message", ex.getMessage());
        body.put("timestamp", LocalDateTime.now());
        
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
} 
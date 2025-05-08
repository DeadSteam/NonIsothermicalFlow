package com.example.nonisothermicalflow.users.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LoginRequest {
    
    @NotBlank(message = "Логин обязателен")
    @Size(min = 3, max = 150, message = "Логин должен быть от 3 до 150 символов")
    private String username;

    @NotBlank(message = "Пароль обязателен")
    @Size(min = 6, max = 64, message = "Пароль должен быть от 6 до 64 символов")
    private String password;
} 
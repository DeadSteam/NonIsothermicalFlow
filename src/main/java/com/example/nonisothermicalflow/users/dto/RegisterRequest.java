package com.example.nonisothermicalflow.users.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    
    @NotBlank(message = "Логин обязателен")
    @Size(min = 3, max = 150, message = "Логин должен быть от 3 до 150 символов")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Логин может содержать только буквы, цифры и знак подчеркивания")
    private String username;

    @NotBlank(message = "Пароль обязателен")
    @Size(min = 6, max = 64, message = "Пароль должен быть от 6 до 64 символов")
    private String password;
} 
package com.example.nonisothermicalflow.config;

import com.example.nonisothermicalflow.users.model.UserRole;
import com.example.nonisothermicalflow.users.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminInitializer.class);
    
    private final UserService userService;
    
    @Value("${app.admin.username}")
    private String adminUsername;
    
    @Value("${app.admin.password}")
    private String adminPassword;
    
    @Autowired
    public AdminInitializer(UserService userService) {
        this.userService = userService;
    }
    
    @Override
    public void run(String... args) {
        try {
            if (!userService.existsByUsername(adminUsername)) {
                logger.info("Создание администратора с логином: {}", adminUsername);
                userService.createUser(adminUsername, adminPassword, UserRole.ADMIN);
                logger.info("Администратор успешно создан");
            } else {
                logger.info("Администратор с логином {} уже существует", adminUsername);
            }
        } catch (Exception e) {
            logger.error("Ошибка при создании администратора: {}", e.getMessage());
        }
    }
} 
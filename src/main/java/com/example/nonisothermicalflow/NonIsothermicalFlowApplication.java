package com.example.nonisothermicalflow;

import com.example.nonisothermicalflow.security.model.Role;
import com.example.nonisothermicalflow.security.model.UserEntity;
import com.example.nonisothermicalflow.security.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class NonIsothermicalFlowApplication {

    public static void main(String[] args) {
        SpringApplication.run(NonIsothermicalFlowApplication.class, args);
    }

}
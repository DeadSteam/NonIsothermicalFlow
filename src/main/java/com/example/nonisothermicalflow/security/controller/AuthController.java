package com.example.nonisothermicalflow.security.controller;

import com.example.nonisothermicalflow.security.jwt.JwtUtil;
import com.example.nonisothermicalflow.security.model.UserEntity;
import com.example.nonisothermicalflow.security.model.Role;
import com.example.nonisothermicalflow.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public String register(@RequestParam String username, @RequestParam String password) {
        if (userRepository.findByUsername(username).isPresent()) {
            return "User already exists!";
        }
        UserEntity user = new UserEntity();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(Role.ROLE_USER);
        userRepository.save(user);
        return "User registered!";
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestParam String username, @RequestParam String password) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
        String token = jwtUtil.generateToken(userRepository.findByUsername(username).get());
        return Map.of("token", token);
    }

    @GetMapping("/me")
    public String me() {
        return "Hello, authenticated user!";
    }
}
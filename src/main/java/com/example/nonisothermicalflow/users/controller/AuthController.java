package com.example.nonisothermicalflow.users.controller;

import com.example.nonisothermicalflow.security.JwtTokenProvider;
import com.example.nonisothermicalflow.security.UserDetailsImpl;
import com.example.nonisothermicalflow.users.dto.JwtResponse;
import com.example.nonisothermicalflow.users.dto.LoginRequest;
import com.example.nonisothermicalflow.users.dto.MessageResponse;
import com.example.nonisothermicalflow.users.dto.RegisterRequest;
import com.example.nonisothermicalflow.users.model.User;
import com.example.nonisothermicalflow.users.model.UserRole;
import com.example.nonisothermicalflow.users.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Контроллер для API аутентификации и регистрации пользователей
 */
@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Аутентификация пользователя
     *
     * @param loginRequest данные для входа
     * @return JWT токен и информация о пользователе
     */
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtTokenProvider.generateToken(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(new JwtResponse(
                    jwt,
                    userDetails.getId(),
                    userDetails.getUsername(),
                    roles));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Ошибка аутентификации: " + e.getMessage());
        }
    }

    /**
     * Регистрация нового пользователя
     *
     * @param registerRequest данные для регистрации
     * @return сообщение об успешной регистрации
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            if (userService.existsByUsername(registerRequest.getUsername())) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Ошибка: Пользователь с таким логином уже существует!"));
            }

            User user = userService.createUser(
                    registerRequest.getUsername(),
                    registerRequest.getPassword(),
                    UserRole.USER);

            return ResponseEntity.ok(new MessageResponse("Пользователь успешно зарегистрирован!"));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ошибка регистрации: " + e.getMessage());
        }
    }
} 
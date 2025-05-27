package com.example.nonisothermicalflow.users.controller;

import com.example.nonisothermicalflow.security.UserDetailsImpl;
import com.example.nonisothermicalflow.users.dto.MessageResponse;
import com.example.nonisothermicalflow.users.model.User;
import com.example.nonisothermicalflow.users.model.UserRole;
import com.example.nonisothermicalflow.users.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

/**
 * Контроллер для API управления пользователями
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * Получение информации о текущем пользователе
     *
     * @return информация о текущем пользователе
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Пользователь не аутентифицирован");
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            User user = userService.findById(userDetails.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Пользователь не найден"));
            
            return ResponseEntity.ok(user);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Ошибка при получении информации о пользователе: " + e.getMessage());
        }
    }

    /**
     * Получение списка всех пользователей
     *
     * @return список всех пользователей
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            List<User> users = userService.findAll();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Ошибка при получении списка пользователей: " + e.getMessage());
        }
    }

    /**
     * Получение информации о пользователе по ID
     *
     * @param id идентификатор пользователя
     * @return информация о пользователе
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or authentication.principal.id == #id")
    public ResponseEntity<?> getUserById(@PathVariable UUID id) {
        try {
            User user = userService.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Пользователь не найден с ID: " + id));
            return ResponseEntity.ok(user);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Ошибка при получении информации о пользователе: " + e.getMessage());
        }
    }
    
    /**
     * Создание нового пользователя
     *
     * @param createUserRequest данные для создания пользователя
     * @return созданный пользователь
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody CreateUserRequest createUserRequest) {
        try {
            UserRole role = createUserRequest.getRoleName() != null && createUserRequest.getRoleName().equals("ADMIN") 
                ? UserRole.ADMIN 
                : UserRole.USER;
                
            User newUser = userService.createUser(
                createUserRequest.getUsername(), 
                createUserRequest.getPassword(), 
                role
            );
            
            return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Ошибка при создании пользователя: " + e.getMessage());
        }
    }

    /**
     * Обновление информации о пользователе
     *
     * @param id идентификатор пользователя
     * @param updateRequest данные для обновления
     * @return обновленный пользователь
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or authentication.principal.id == #id")
    public ResponseEntity<?> updateUser(
            @PathVariable UUID id,
            @RequestBody UpdateUserRequest updateRequest) {
        try {
            UserRole role = null;
            if (updateRequest.getRoleName() != null) {
                role = UserRole.fromString(updateRequest.getRoleName());
            }
            
            User updatedUser = userService.updateUser(
                id, 
                updateRequest.getUsername(), 
                updateRequest.getPassword(),
                role
            );
            
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Ошибка при обновлении пользователя: " + e.getMessage());
        }
    }

    /**
     * Удаление пользователя
     *
     * @param id идентификатор пользователя
     * @return сообщение об успешном удалении
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable UUID id) {
        try {
            if (!userService.findById(id).isPresent()) {
                throw new EntityNotFoundException("Пользователь не найден с ID: " + id);
            }
            
            userService.deleteById(id);
            return ResponseEntity.ok(new MessageResponse("Пользователь успешно удален"));
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Ошибка при удалении пользователя: " + e.getMessage());
        }
    }
    
    /**
     * Класс для запроса создания пользователя
     */
    public static class CreateUserRequest {
        private String username;
        private String password;
        private String roleName;
        
        public String getUsername() {
            return username;
        }
        
        public void setUsername(String username) {
            this.username = username;
        }
        
        public String getPassword() {
            return password;
        }
        
        public void setPassword(String password) {
            this.password = password;
        }
        
        public String getRoleName() {
            return roleName;
        }
        
        public void setRoleName(String roleName) {
            this.roleName = roleName;
        }
    }

    /**
     * Класс для запроса обновления пользователя
     */
    public static class UpdateUserRequest {
        private String username;
        private String password;
        private String roleName;
        
        public String getUsername() {
            return username;
        }
        
        public void setUsername(String username) {
            this.username = username;
        }
        
        public String getPassword() {
            return password;
        }
        
        public void setPassword(String password) {
            this.password = password;
        }
        
        public String getRoleName() {
            return roleName;
        }
        
        public void setRoleName(String roleName) {
            this.roleName = roleName;
        }
    }
} 
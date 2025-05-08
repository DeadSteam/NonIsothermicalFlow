package com.example.nonisothermicalflow.users.controller;

import com.example.nonisothermicalflow.security.UserDetailsImpl;
import com.example.nonisothermicalflow.users.dto.MessageResponse;
import com.example.nonisothermicalflow.users.model.User;
import com.example.nonisothermicalflow.users.model.UserRole;
import com.example.nonisothermicalflow.users.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(new MessageResponse("Пользователь не аутентифицирован"));
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userService.findById(userDetails.getId())
                .orElseThrow(() -> new EntityNotFoundException("Пользователь не найден"));
        
        return ResponseEntity.ok(user);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.findAll();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or authentication.principal.id == #id")
    public ResponseEntity<?> getUserById(@PathVariable UUID id) {
        User user = userService.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Пользователь не найден с ID: " + id));
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or authentication.principal.id == #id")
    public ResponseEntity<?> updateUser(
            @PathVariable UUID id,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String password) {
        
        try {
            User updatedUser = userService.updateUser(id, username, password);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable UUID id) {
        if (!userService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        userService.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Пользователь успешно удален"));
    }
} 
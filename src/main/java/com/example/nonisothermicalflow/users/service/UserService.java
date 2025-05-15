package com.example.nonisothermicalflow.users.service;

import com.example.nonisothermicalflow.users.model.Role;
import com.example.nonisothermicalflow.users.model.User;
import com.example.nonisothermicalflow.users.model.UserRole;
import com.example.nonisothermicalflow.users.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleService roleService;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, RoleService roleService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleService = roleService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<User> findById(UUID id) {
        return userRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Transactional
    public User save(User user) {
        return userRepository.save(user);
    }

    @Transactional
    public User createUser(String username, String password, UserRole userRole) {
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Пользователь с логином " + username + " уже существует");
        }

        Role role = roleService.getOrCreateRole(userRole);
        
        User user = new User();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        
        return userRepository.save(user);
    }

    @Transactional
    public User updateUser(UUID id, String username, String password) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Пользователь не найден с ID: " + id));
        
        if (username != null && !username.isBlank()) {
            if (!user.getUsername().equals(username) && userRepository.existsByUsername(username)) {
                throw new IllegalArgumentException("Пользователь с логином " + username + " уже существует");
            }
            user.setUsername(username);
        }
        
        if (password != null && !password.isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(password));
        }
        
        return userRepository.save(user);
    }

    @Transactional
    public User updateUser(UUID id, String username, String password, UserRole role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Пользователь не найден с ID: " + id));
        
        if (username != null && !username.isBlank()) {
            if (!user.getUsername().equals(username) && userRepository.existsByUsername(username)) {
                throw new IllegalArgumentException("Пользователь с логином " + username + " уже существует");
            }
            user.setUsername(username);
        }
        
        if (password != null && !password.isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(password));
        }
        
        if (role != null) {
            Role roleEntity = roleService.getOrCreateRole(role);
            user.setRole(roleEntity);
        }
        
        return userRepository.save(user);
    }

    @Transactional
    public void deleteById(UUID id) {
        userRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
} 
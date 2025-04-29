package com.example.nonisothermicalflow.users.service;

import com.example.nonisothermicalflow.users.model.Role;
import com.example.nonisothermicalflow.users.model.UserRole;
import com.example.nonisothermicalflow.users.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class RoleService {
    
    private final RoleRepository roleRepository;
    
    @Autowired
    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }
    
    @Transactional(readOnly = true)
    public Optional<Role> findById(UUID id) {
        return roleRepository.findById(id);
    }
    
    @Transactional(readOnly = true)
    public Optional<Role> findByName(String name) {
        return roleRepository.findByName(name);
    }
    
    @Transactional(readOnly = true)
    public Optional<Role> findByUserRole(UserRole userRole) {
        return roleRepository.findByName(userRole.getRoleName());
    }
    
    @Transactional
    public Role save(Role role) {
        return roleRepository.save(role);
    }
    
    @Transactional
    public Role getOrCreateRole(UserRole userRole) {
        return findByUserRole(userRole)
                .orElseGet(() -> {
                    Role newRole = Role.fromUserRole(userRole);
                    return save(newRole);
                });
    }
} 
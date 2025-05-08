package com.example.nonisothermicalflow.users.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private UUID id;
    private String username;
    private List<String> roles;

    public JwtResponse(String token, UUID id, String username, List<String> roles) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.roles = roles;
    }
} 
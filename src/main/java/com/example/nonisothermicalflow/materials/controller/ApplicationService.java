package com.example.nonisothermicalflow.materials.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("items")
public class ApplicationService
{
    @GetMapping("Hello")
    public String hello(){
        return "Hello";
    }
}

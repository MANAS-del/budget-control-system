package com.budget.dto;

import lombok.Data;

@Data
public class SignupRequest {
    private String name;
    private String email;
    private String password;
    private String role;
    private String department;
    private String specialKey;
}

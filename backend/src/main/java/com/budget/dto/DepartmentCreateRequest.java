package com.budget.dto;

import lombok.Data;

@Data
public class DepartmentCreateRequest {
    private String name;
    private Double totalBudget;
}

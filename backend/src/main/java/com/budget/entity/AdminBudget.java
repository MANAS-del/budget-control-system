package com.budget.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class AdminBudget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String adminId;

    @Column(columnDefinition = "DOUBLE DEFAULT 0.0")
    private Double totalBudget = 0.0;

    @Column(columnDefinition = "DOUBLE DEFAULT 0.0")
    private Double usedBudget = 0.0;

    public Double getRemainingBudget() {
        return totalBudget - usedBudget;
    }
}

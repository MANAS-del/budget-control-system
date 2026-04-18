package com.budget.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class RequestHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = true)
    private Long requestId;

    private String action; // e.g., "APPROVED", "REJECTED", "ESCALATED", "CREATED"

    private String actionBy; // e.g., "mg101", "emp101", "ad101"

    private LocalDateTime timestamp = LocalDateTime.now();
}

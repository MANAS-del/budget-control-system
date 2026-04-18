package com.budget.dto;

import lombok.Data;

@Data
public class ManagerActionRequest {
    private Long requestId;
    private String action; // "APPROVE" or "REJECT" (ESCALATE is determined by logic or can be explicit)
}

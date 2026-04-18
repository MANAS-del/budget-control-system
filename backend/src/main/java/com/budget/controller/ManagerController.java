package com.budget.controller;

import com.budget.dto.ManagerActionRequest;
import com.budget.entity.Budget;
import com.budget.entity.Request;
import com.budget.service.ManagerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/manager")
public class ManagerController {

    private final ManagerService managerService;

    public ManagerController(ManagerService managerService) {
        this.managerService = managerService;
    }

    @GetMapping("/requests")
    public ResponseEntity<List<Request>> getManagerRequests(@RequestHeader("X-User-Id") String managerId) {
        return ResponseEntity.ok(managerService.getManagerRequests(managerId));
    }

    @PostMapping("/action")
    public ResponseEntity<?> actionRequest(@RequestBody ManagerActionRequest request, @RequestHeader("X-User-Id") String managerId) {
        try {
            Request processedRequest = managerService.handleRequest(request, managerId);
            return ResponseEntity.ok(processedRequest);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my-budget")
    public ResponseEntity<Budget> getMyBudget(@RequestHeader("X-User-Id") String managerId) {
        try {
            return ResponseEntity.ok(managerService.getMyBudget(managerId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}

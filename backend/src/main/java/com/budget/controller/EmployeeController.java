package com.budget.controller;

import com.budget.entity.Request;
import com.budget.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/employee")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @PostMapping(value = "/request", consumes = {"multipart/form-data"})
    public ResponseEntity<?> submitRequest(
            @RequestParam("purpose") String purpose,
            @RequestParam("category") String category,
            @RequestParam("amount") Double amount,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestHeader("X-User-Id") String employeeId) {
        try {
            Request request = employeeService.submitRequest(purpose, category, amount, description, file, employeeId);
            return ResponseEntity.ok("Request submitted successfully with ID: " + request.getId());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my-requests")
    public ResponseEntity<List<Request>> getMyRequests(@RequestHeader("X-User-Id") String employeeId) {
        return ResponseEntity.ok(employeeService.getMyRequests(employeeId));
    }
}

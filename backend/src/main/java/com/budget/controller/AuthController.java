package com.budget.controller;

import com.budget.dto.LoginRequest;
import com.budget.dto.SignupRequest;
import com.budget.entity.Role;
import com.budget.entity.User;
import com.budget.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.budget.service.NotificationService notificationService;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, com.budget.service.NotificationService notificationService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationService = notificationService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        Role roleEnum;
        try {
            roleEnum = Role.valueOf(request.getRole().toUpperCase());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid role");
        }

        if (roleEnum == Role.ADMIN) {
            boolean adminExists = userRepository.findFirstByRole(Role.ADMIN).isPresent();
            if (adminExists) {
                throw new RuntimeException("An admin already exists in the system. Only one admin is allowed.");
            }
            if (!"COMPANY_ADMIN_2026".equals(request.getSpecialKey())) {
                return ResponseEntity.badRequest().body("Invalid special key for ADMIN");
            }
        } else if (roleEnum == Role.MANAGER) {
            boolean deptManagerExists = userRepository.existsByRoleAndDepartment(Role.MANAGER, request.getDepartment());
            if (deptManagerExists) {
                throw new RuntimeException("A manager already exists for department: " + request.getDepartment() + ". Each department can only have one manager.");
            }
            if (!"COMPANY_MGR_2026".equals(request.getSpecialKey())) {
                return ResponseEntity.badRequest().body("Invalid special key for MANAGER");
            }
        }

        User user = new User();
        
        String prefix = "emp";
        if (roleEnum == Role.MANAGER) prefix = "mgr";
        else if (roleEnum == Role.ADMIN) prefix = "adm";

        User lastUser = userRepository.findFirstByRoleOrderByUserIdDesc(roleEnum).orElse(null);
        int nextIdNum = 101;
        if (lastUser != null && lastUser.getUserId() != null && lastUser.getUserId().startsWith(prefix)) {
            try {
                nextIdNum = Integer.parseInt(lastUser.getUserId().substring(prefix.length())) + 1;
            } catch (Exception e) {}
        }
        user.setUserId(prefix + nextIdNum);
        
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(roleEnum);
        if (user.getRole() != Role.ADMIN) {
            user.setDepartment(request.getDepartment());
        }
        
        userRepository.save(user);

        if (user.getRole() == Role.MANAGER) {
            java.util.Optional<User> admin = userRepository.findFirstByRole(Role.ADMIN);
            if (admin.isPresent()) {
                notificationService.createNotification(
                    admin.get().getUserId(),
                    "New manager registered: " + user.getName() + " (" + user.getUserId() + ") for department " + user.getDepartment() + ". Please assign their budget.",
                    "MANAGER_REGISTERED"
                );
            }
        }

        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail()).orElse(null);

        if (user == null) {
            return ResponseEntity.status(401).body("Invalid Email: User not found!");
        }
        
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body("Invalid Password! Please try again.");
        }

        if (!user.getRole().name().equalsIgnoreCase(loginRequest.getRole())) {
            return ResponseEntity.status(401).body("Role Mismatch: You selected " + loginRequest.getRole() + " but your account is " + user.getRole().name());
        }

        if (user.getRole() != Role.ADMIN) {
            if (user.getDepartment() == null || !user.getDepartment().equalsIgnoreCase(loginRequest.getDepartment())) {
                return ResponseEntity.status(401).body("Department Mismatch: Account is registered to " + user.getDepartment());
            }
        }

        if (user.getRole() == Role.ADMIN) {
            if (!"COMPANY_ADMIN_2026".equals(loginRequest.getSpecialKey())) {
                return ResponseEntity.status(401).body("Security Alert: Invalid Admin Key");
            }
        } else if (user.getRole() == Role.MANAGER) {
            if (!"COMPANY_MGR_2026".equals(loginRequest.getSpecialKey())) {
                return ResponseEntity.status(401).body("Security Alert: Invalid Manager Key");
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("userId", user.getUserId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole().name());
        response.put("department", user.getDepartment());
        response.put("message", "Login successful");
        
        return ResponseEntity.ok(response);
    }
}

package com.budget.service;

import com.budget.entity.*;
import com.budget.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class EmployeeService {

    private final RequestRepository requestRepository;
    private final UserRepository userRepository;
    private final RequestHistoryRepository requestHistoryRepository;

    private final String UPLOAD_DIR = "uploads/";

    public EmployeeService(RequestRepository requestRepository, UserRepository userRepository, RequestHistoryRepository requestHistoryRepository) {
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
        this.requestHistoryRepository = requestHistoryRepository;
        
        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }
    }

    @Transactional
    public Request submitRequest(String purpose, String category, Double amount, String description, MultipartFile file, String employeeId) throws IOException {
        User employee = userRepository.findByUserId(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (employee.getDepartment() == null || employee.getDepartment().isEmpty()) {
            throw new RuntimeException("Employee is not bound to a department");
        }

        User manager = userRepository.findFirstByRoleAndDepartment(Role.MANAGER, employee.getDepartment())
                .orElseThrow(() -> new RuntimeException("No manager found for this department. Cannot submit request."));

        String attachmentPath = null;
        if (file != null && !file.isEmpty()) {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(UPLOAD_DIR + fileName);
            Files.write(filePath, file.getBytes());
            attachmentPath = "/uploads/" + fileName;
        }

        Request request = new Request();
        request.setEmployeeId(employeeId);
        request.setManagerId(manager.getUserId());
        request.setDepartment(employee.getDepartment());
        request.setPurpose(purpose);
        request.setCategory(category);
        request.setAmount(amount);
        request.setDescription(description);
        request.setStatus(Status.PENDING);
        request.setAttachmentPath(attachmentPath);

        Request savedRequest = requestRepository.save(request);

        RequestHistory history = new RequestHistory();
        history.setRequestId(savedRequest.getId());
        history.setAction("CREATED");
        history.setActionBy(employeeId);
        requestHistoryRepository.save(history);

        return savedRequest;
    }

    public List<Request> getMyRequests(String employeeId) {
        return requestRepository.findByEmployeeId(employeeId);
    }
}

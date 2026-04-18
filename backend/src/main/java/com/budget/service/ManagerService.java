package com.budget.service;

import com.budget.dto.ManagerActionRequest;
import com.budget.entity.*;
import com.budget.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ManagerService {

    private final RequestRepository requestRepository;
    private final BudgetRepository budgetRepository;
    private final RequestHistoryRepository requestHistoryRepository;

    public ManagerService(RequestRepository requestRepository, BudgetRepository budgetRepository, RequestHistoryRepository requestHistoryRepository) {
        this.requestRepository = requestRepository;
        this.budgetRepository = budgetRepository;
        this.requestHistoryRepository = requestHistoryRepository;
    }

    public List<Request> getManagerRequests(String managerId) {
        return requestRepository.findByManagerId(managerId);
    }

    public Budget getMyBudget(String managerId) {
        return budgetRepository.findByManagerId(managerId)
                .orElseThrow(() -> new RuntimeException("Budget not allocated to this manager yet"));
    }

    @Transactional
    public Request handleRequest(ManagerActionRequest dto, String managerId) {
        Request request = requestRepository.findById(dto.getRequestId())
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!managerId.equals(request.getManagerId())) {
            throw new RuntimeException("Not authorized to act on this request");
        }

        if (request.getStatus() != Status.PENDING) {
            throw new RuntimeException("Request is already processed");
        }

        Budget budget = budgetRepository.findByManagerId(managerId)
                .orElseThrow(() -> new RuntimeException("Budget not allocated for this manager"));

        String actionTaken;

        if ("APPROVE".equalsIgnoreCase(dto.getAction())) {
            if (request.getAmount() <= budget.getRemainingBudget()) {
                request.setStatus(Status.APPROVED);
                budget.setUsedBudget(budget.getUsedBudget() + request.getAmount());
                budgetRepository.save(budget);
                actionTaken = "APPROVED";
            } else {
                throw new RuntimeException("Cannot APPROVE: Amount exceeds remaining budget. You must ESCALATE instead.");
            }
        } else if ("REJECT".equalsIgnoreCase(dto.getAction())) {
            request.setStatus(Status.REJECTED);
            actionTaken = "REJECTED";
        } else if ("ESCALATE".equalsIgnoreCase(dto.getAction())) {
            if (request.getAmount() <= budget.getRemainingBudget()) {
                throw new RuntimeException("Request is within budget. You must APPROVE or REJECT it directly.");
            }
            request.setStatus(Status.ESCALATED);
            actionTaken = "ESCALATED";
        } else {
            throw new RuntimeException("Invalid action");
        }

        requestRepository.save(request);

        RequestHistory history = new RequestHistory();
        history.setRequestId(request.getId());
        history.setAction(actionTaken);
        history.setActionBy(managerId);
        requestHistoryRepository.save(history);

        return request;
    }
}

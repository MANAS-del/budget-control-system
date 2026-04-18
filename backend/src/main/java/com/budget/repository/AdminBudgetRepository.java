package com.budget.repository;

import com.budget.entity.AdminBudget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminBudgetRepository extends JpaRepository<AdminBudget, Long> {
    Optional<AdminBudget> findByAdminId(String adminId);
}

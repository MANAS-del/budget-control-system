package com.budget.repository;

import com.budget.entity.Request;
import com.budget.entity.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RequestRepository extends JpaRepository<Request, Long> {
    List<Request> findByEmployeeId(String employeeId);
    List<Request> findByDepartment(String department);
    List<Request> findByManagerId(String managerId);
    List<Request> findByStatus(Status status);
}

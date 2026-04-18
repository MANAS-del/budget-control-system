package com.budget.repository;

import com.budget.entity.User;
import com.budget.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUserId(String userId);
    Optional<User> findByEmail(String email);
    
    Optional<User> findFirstByRoleOrderByUserIdDesc(Role role);
    
    Optional<User> findFirstByRoleAndDepartment(Role role, String department);
    
    Optional<User> findFirstByRole(Role role);
    boolean existsByRoleAndDepartment(Role role, String department);
}

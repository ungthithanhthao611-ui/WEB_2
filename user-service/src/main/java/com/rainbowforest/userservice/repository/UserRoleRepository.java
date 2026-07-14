package com.rainbowforest.userservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import com.rainbowforest.userservice.entity.UserRole;

import org.springframework.data.jpa.repository.Query;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, Long> {
    @Query(value = "SELECT * FROM user_role WHERE role_name = ?1 LIMIT 1", nativeQuery = true)
    UserRole findUserRoleByRoleName(String roleName);
}

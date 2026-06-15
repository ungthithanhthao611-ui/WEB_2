package com.rainbowforest.orderservice.repository;

import com.rainbowforest.orderservice.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}

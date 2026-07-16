package com.rainbowforest.orderservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rainbowforest.orderservice.domain.Order;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
    Optional<Order> findByIdempotencyKey(String idempotencyKey);
    List<Order> findByPaymentMethodAndStatusAndCreatedAtBefore(String paymentMethod, String status, java.time.LocalDateTime dateTime);
}

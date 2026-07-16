package com.rainbowforest.paymentservice.repository;

import com.rainbowforest.paymentservice.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByTxnRef(String txnRef);
    Optional<Payment> findByOrderIdAndStatus(Long orderId, com.rainbowforest.paymentservice.model.PaymentStatus status);
}

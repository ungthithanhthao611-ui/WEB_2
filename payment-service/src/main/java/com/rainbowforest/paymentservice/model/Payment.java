package com.rainbowforest.paymentservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "provider", nullable = false)
    private String provider; // VNPAY

    @Column(name = "txn_ref", unique = true, nullable = false)
    private String txnRef; // VNPAY transaction reference

    @Column(name = "provider_transaction_no", unique = true)
    private String providerTransactionNo; // VNPAY Transaction Number (vnp_TransactionNo)

    @Column(name = "amount", nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PaymentStatus status;

    @Column(name = "response_code")
    private String responseCode; // vnp_ResponseCode

    @Column(name = "transaction_status")
    private String transactionStatus; // vnp_TransactionStatus

    @Column(name = "bank_code")
    private String bankCode;

    @Column(name = "bank_transaction_no")
    private String bankTransactionNo;

    @Column(name = "card_type")
    private String cardType;

    @Column(name = "payment_url", length = 2000)
    private String paymentUrl;

    @Column(name = "failure_reason", length = 500)
    private String failureReason;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "expired_at")
    private LocalDateTime expiredAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

}

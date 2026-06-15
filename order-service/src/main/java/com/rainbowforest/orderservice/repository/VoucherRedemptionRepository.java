package com.rainbowforest.orderservice.repository;
import com.rainbowforest.orderservice.domain.VoucherRedemption;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface VoucherRedemptionRepository extends JpaRepository<VoucherRedemption,Long>{long countByVoucherIdAndUserId(Long voucherId,Long userId);Optional<VoucherRedemption> findByOrderId(Long orderId);}

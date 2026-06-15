package com.rainbowforest.orderservice.repository;
import com.rainbowforest.orderservice.domain.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface VoucherRepository extends JpaRepository<Voucher,Long>{Optional<Voucher> findByCodeIgnoreCase(String code);}

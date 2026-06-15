package com.rainbowforest.orderservice.repository;
import com.rainbowforest.orderservice.domain.ShippingMethod; import org.springframework.data.jpa.repository.JpaRepository;
public interface ShippingMethodRepository extends JpaRepository<ShippingMethod,String>{}

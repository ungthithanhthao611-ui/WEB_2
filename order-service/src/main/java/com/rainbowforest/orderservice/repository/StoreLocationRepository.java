package com.rainbowforest.orderservice.repository;
import com.rainbowforest.orderservice.domain.StoreLocation; import org.springframework.data.jpa.repository.JpaRepository; import java.util.Optional;
public interface StoreLocationRepository extends JpaRepository<StoreLocation,Long>{Optional<StoreLocation> findByNameAndActiveTrue(String name);Optional<StoreLocation> findByNameIgnoreCaseAndActiveTrue(String name);}

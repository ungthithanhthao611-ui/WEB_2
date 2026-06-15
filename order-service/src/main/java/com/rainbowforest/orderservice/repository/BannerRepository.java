package com.rainbowforest.orderservice.repository;
import com.rainbowforest.orderservice.domain.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface BannerRepository extends JpaRepository<Banner,Long>{List<Banner> findAllByOrderBySortOrderAsc();}

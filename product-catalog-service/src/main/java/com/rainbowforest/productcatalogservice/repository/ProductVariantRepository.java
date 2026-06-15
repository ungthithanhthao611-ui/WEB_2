package com.rainbowforest.productcatalogservice.repository;
import com.rainbowforest.productcatalogservice.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface ProductVariantRepository extends JpaRepository<ProductVariant,Long>{List<ProductVariant> findByProductIdOrderByPriceAsc(Long productId);Optional<ProductVariant> findBySku(String sku);}

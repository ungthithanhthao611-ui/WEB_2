package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.entity.ProductVariant;
import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.repository.ProductVariantRepository;
import com.rainbowforest.productcatalogservice.repository.ProductRepository;
import jakarta.transaction.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.math.BigDecimal;

@RestController
@RequestMapping("/internal/inventory")
public class InventoryController {
    private final ProductVariantRepository repository; private final ProductRepository products;
    public InventoryController(ProductVariantRepository repository,ProductRepository products){this.repository=repository;this.products=products;}
    public record InventoryItem(Long productId,String sku,Integer quantity,BigDecimal expectedPrice){}

    @PostMapping("/reserve") @Transactional
    public void reserve(@RequestBody List<InventoryItem> items){
        for(InventoryItem item:items){
            if(item.sku()==null||item.sku().isBlank()){
                Product product=products.findById(item.productId()).orElseThrow(()->new IllegalArgumentException("Không tìm thấy sản phẩm"));
                if(product.getAvailability()<item.quantity())throw new IllegalArgumentException(product.getProductName()+" chỉ còn "+product.getAvailability());
                if(item.expectedPrice()==null||product.getPrice().compareTo(item.expectedPrice())!=0)throw new IllegalArgumentException("Giá sản phẩm đã thay đổi, vui lòng tải lại giỏ hàng");
                product.setAvailability(product.getAvailability()-item.quantity());products.save(product);continue;
            }
            ProductVariant variant=repository.findBySku(item.sku()).orElseThrow(()->new IllegalArgumentException("Không tìm thấy SKU "+item.sku()));
            if(!variant.isActive()||variant.getStock()<item.quantity())throw new IllegalArgumentException("Sản phẩm "+variant.getName()+" chỉ còn "+variant.getStock());
            BigDecimal currentPrice=variant.getSalePrice()!=null&&variant.getSalePrice().compareTo(BigDecimal.ZERO)>0?variant.getSalePrice():variant.getPrice();
            if(item.expectedPrice()==null||currentPrice.compareTo(item.expectedPrice())!=0)throw new IllegalArgumentException("Giá sản phẩm đã thay đổi, vui lòng tải lại giỏ hàng");
            variant.setStock(variant.getStock()-item.quantity()); repository.save(variant);
        }
    }

    @PostMapping("/release") @Transactional
    public void release(@RequestBody List<InventoryItem> items){
        for(InventoryItem item:items){if(item.sku()==null||item.sku().isBlank()){products.findById(item.productId()).ifPresent(product->{product.setAvailability(product.getAvailability()+item.quantity());products.save(product);});}else{repository.findBySku(item.sku()).ifPresent(variant->{variant.setStock(variant.getStock()+item.quantity());repository.save(variant);});}}
    }
}

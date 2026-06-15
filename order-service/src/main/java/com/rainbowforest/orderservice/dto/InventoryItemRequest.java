package com.rainbowforest.orderservice.dto;
import java.math.BigDecimal;
public record InventoryItemRequest(Long productId, String sku, Integer quantity, BigDecimal expectedPrice) {}

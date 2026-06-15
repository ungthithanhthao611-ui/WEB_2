package com.rainbowforest.orderservice.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record CheckoutItemRequest(
    @NotNull Long productId,
    @NotBlank String productName,
    @Size(max = 50) String size,
    @Size(max = 100) String sku,
    @NotNull @Positive BigDecimal unitPrice,
    @NotNull @Positive Integer quantity
) {}

package com.rainbowforest.orderservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public record CheckoutRequest(
    @NotNull Long userId,
    @NotBlank @Size(max = 120) String recipientName,
    @NotBlank @Pattern(regexp = "^0\\d{9}$") String phone,
    @NotBlank @Size(max = 500) String address,
    @NotBlank String district,
    @NotBlank String store,
    @NotBlank String shippingMethod,
    @NotBlank String paymentMethod,
    @Size(max = 1000) String note,
    @Size(max = 50) String voucherCode,
    @NotNull @PositiveOrZero BigDecimal shippingFee,
    @NotNull @PositiveOrZero BigDecimal discount,
    @NotEmpty List<@Valid CheckoutItemRequest> items
) {}

package com.rainbowforest.paymentservice.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderDTO {
    private Long id;
    private String orderCode;
    private String status;
    private BigDecimal total;
    private String paymentStatus;
    private String paymentMethod;
    private UserDTO user;

    @Data
    public static class UserDTO {
        private Long id;
        private String userName;
    }
}

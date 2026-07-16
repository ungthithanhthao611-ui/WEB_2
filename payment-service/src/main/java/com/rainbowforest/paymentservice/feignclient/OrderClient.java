package com.rainbowforest.paymentservice.feignclient;

import com.rainbowforest.paymentservice.dto.OrderDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "order-service")
public interface OrderClient {
    @GetMapping(value = "/order/{orderId}")
    OrderDTO getOrderById(@PathVariable("orderId") Long orderId);

    @PutMapping(value = "/order/{orderId}/payment-status")
    OrderDTO updateOrderStatus(@PathVariable("orderId") Long orderId, @RequestBody Map<String, String> statusMap);

    @PutMapping(value = "/order/{orderId}/status")
    OrderDTO changeOrderStatus(@PathVariable("orderId") Long orderId, @RequestBody Map<String, String> statusMap);
}

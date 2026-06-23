package com.rainbowforest.orderservice.feignclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.rainbowforest.orderservice.domain.User;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.Map;

@FeignClient(name = "user-service")
public interface UserClient {

    @GetMapping(value = "/users/{id}")
    public User getUserById(@PathVariable("id") Long id);

    @PostMapping(value = "/users/send-invoice")
    public void sendOrderInvoiceEmail(@RequestBody Map<String, Object> event);
}

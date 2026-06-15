package com.rainbowforest.orderservice.controller;

import com.rainbowforest.orderservice.domain.Item;
import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.domain.User;
import com.rainbowforest.orderservice.feignclient.UserClient;
import com.rainbowforest.orderservice.http.header.HeaderGenerator;
import com.rainbowforest.orderservice.service.CartService;
import com.rainbowforest.orderservice.service.OrderService;
import com.rainbowforest.orderservice.service.CheckoutService;
import com.rainbowforest.orderservice.dto.CheckoutRequest;
import jakarta.validation.Valid;
import com.rainbowforest.orderservice.utilities.OrderUtilities;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.math.BigDecimal;

import jakarta.servlet.http.HttpServletRequest;

@RestController
public class OrderController {

    @Autowired
    private UserClient userClient;

    @Autowired
    private OrderService orderService;

    @Autowired
    private CartService cartService;

    @Autowired
    private HeaderGenerator headerGenerator;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Autowired
    private CheckoutService checkoutService;

    @PostMapping(value = "/orders/checkout")
    public ResponseEntity<Order> checkout(
            @Valid @RequestBody CheckoutRequest checkoutRequest,
            @RequestHeader("Idempotency-Key") String idempotencyKey) {
        return ResponseEntity.status(HttpStatus.CREATED).body(checkoutService.checkout(checkoutRequest, idempotencyKey));
    }
    
    @PostMapping(value = "/order/{userId}")
    public ResponseEntity<Order> saveOrder(
    		@PathVariable("userId") Long userId,
    		@RequestHeader(value = "Cart-Id") String cartId,
    		HttpServletRequest request){
    	
        List<Item> cart = cartService.getAllItemsFromCart(cartId);
        User user = userClient.getUserById(userId);   
        if(cart != null && !cart.isEmpty() && user != null) {
        	Order order = this.createOrder(cart, user);
        	try{
                orderService.saveOrder(order);
                cartService.deleteCart(cartId);

                // Gửi event Kafka
                try {
                    Map<String, Object> orderEvent = new HashMap<>();
                    orderEvent.put("orderId", order.getId());
                    orderEvent.put("userId", userId);
                    orderEvent.put("total", order.getTotal());
                    orderEvent.put("status", order.getStatus());
                    kafkaTemplate.send("order-events", orderEvent);
                } catch (Exception ke) {
                    System.err.println("Lỗi gửi Kafka event: " + ke.getMessage());
                }

                return new ResponseEntity<Order>(
                		order, 
                		headerGenerator.getHeadersForSuccessPostMethod(request, order.getId()),
                		HttpStatus.CREATED);
            }catch (Exception ex){
                ex.printStackTrace();
                return new ResponseEntity<Order>(
                		headerGenerator.getHeadersForError(),
                		HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
  
        return new ResponseEntity<Order>(
				headerGenerator.getHeadersForError(),
				HttpStatus.BAD_REQUEST);
    }
    
    @GetMapping(value = "/order")
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return new ResponseEntity<List<Order>>(orders, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }

    @GetMapping(value = "/order/user/{userId}")
    public ResponseEntity<List<Order>> getOrdersByUserId(@PathVariable("userId") Long userId) {
        List<Order> orders = orderService.getOrdersByUserId(userId);
        return new ResponseEntity<List<Order>>(orders, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }

    @PutMapping(value = "/order/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable("orderId") Long orderId, @RequestBody Map<String, String> statusMap) {
        Order order = checkoutService.changeStatus(orderId, statusMap.get("status"), statusMap.get("changedBy"), statusMap.get("reason"));
        return new ResponseEntity<Order>(order, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }

    @PutMapping(value = "/order/{orderId}/cancel")
    public ResponseEntity<Order> cancelOrder(@PathVariable Long orderId, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(checkoutService.cancelByCustomer(orderId, Long.valueOf(body.get("userId")), body.get("reason")));
    }

    @GetMapping(value = "/order/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        List<Order> orders = orderService.getAllOrders();
        BigDecimal revenue = orders.stream()
                .filter(order -> "COMPLETED".equals(order.getStatus()))
                .map(Order::getTotal).filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long pending = orders.stream().filter(order -> "PENDING_CONFIRMATION".equals(order.getStatus())).count();
        long completed = orders.stream().filter(order -> "COMPLETED".equals(order.getStatus())).count();
        long cancelled = orders.stream().filter(order -> "CANCELLED".equals(order.getStatus()) || "REJECTED".equals(order.getStatus())).count();
        return ResponseEntity.ok(Map.of(
                "totalOrders", orders.size(),
                "pendingOrders", pending,
                "completedOrders", completed,
                "cancelledOrders", cancelled,
                "revenue", revenue));
    }

    private Order createOrder(List<Item> cart, User user) {
        Order order = new Order();
        order.setItems(cart);
        order.setUser(user);
        order.setTotal(OrderUtilities.countTotalPrice(cart));
        order.setOrderedDate(LocalDate.now());
        order.setStatus("PAYMENT_EXPECTED");
        return order;
    }
}

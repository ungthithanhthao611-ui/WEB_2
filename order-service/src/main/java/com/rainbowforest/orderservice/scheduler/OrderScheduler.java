package com.rainbowforest.orderservice.scheduler;

import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.repository.OrderRepository;
import com.rainbowforest.orderservice.service.CheckoutService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class OrderScheduler {
    private static final Logger log = LoggerFactory.getLogger(OrderScheduler.class);

    private final OrderRepository orderRepository;
    private final CheckoutService checkoutService;

    public OrderScheduler(OrderRepository orderRepository, CheckoutService checkoutService) {
        this.orderRepository = orderRepository;
        this.checkoutService = checkoutService;
    }

    // Runs every 5 minutes
    @Scheduled(cron = "0 */5 * * * *")
    public void cancelExpiredUnpaidOrders() {
        log.info("Starting cron job to scan and cancel expired unpaid VNPAY orders...");
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(20);
        
        List<Order> expiredOrders = orderRepository.findByPaymentMethodAndStatusAndCreatedAtBefore(
                "VNPAY", 
                "PENDING_CONFIRMATION", 
                threshold
        );

        if (!expiredOrders.isEmpty()) {
            log.info("Found {} expired unpaid VNPAY orders to cancel", expiredOrders.size());
            for (Order order : expiredOrders) {
                try {
                    checkoutService.changeStatus(
                            order.getId(), 
                            "CANCELLED", 
                            "SYSTEM", 
                            "Hết hạn thời gian thanh toán trực tuyến (20 phút)"
                    );
                    log.info("Successfully cancelled expired VNPAY order ID: {}", order.getId());
                } catch (Exception e) {
                    log.error("Failed to automatically cancel order ID {}: {}", order.getId(), e.getMessage());
                }
            }
        }
    }
}

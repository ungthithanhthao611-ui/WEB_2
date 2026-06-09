package com.rainbowforest.paymentservice.consumer;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class OrderEventConsumer {

    @KafkaListener(topics = "order-events", groupId = "payment-group")
    public void consumeOrderEvent(Map<String, Object> orderEvent) {
        System.out.println("=================================================");
        System.out.println("PAYMENT SERVICE: Nhận sự kiện Order từ Kafka!");
        System.out.println("Mã đơn hàng: " + orderEvent.get("orderId"));
        System.out.println("Mã người dùng: " + orderEvent.get("userId"));
        System.out.println("Tổng tiền: " + orderEvent.get("total"));
        System.out.println("Trạng thái hiện tại: " + orderEvent.get("status"));
        System.out.println("Đang tiến hành xử lý thanh toán giả lập...");
        try {
            Thread.sleep(1500);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("Thanh toán thành công cho đơn hàng #" + orderEvent.get("orderId"));
        System.out.println("=================================================");
    }
}

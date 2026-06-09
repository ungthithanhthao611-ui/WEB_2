package com.rainbowforest.notificationservice.consumer;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class NotificationEventConsumer {

    @KafkaListener(topics = "order-events", groupId = "notification-group")
    public void consumeOrderEvent(Map<String, Object> orderEvent) {
        System.out.println("=================================================");
        System.out.println("NOTIFICATION SERVICE: Nhận sự kiện Order từ Kafka!");
        System.out.println("Mã đơn hàng: " + orderEvent.get("orderId"));
        System.out.println("Khách hàng: ID #" + orderEvent.get("userId"));
        System.out.println("GỬI THÔNG BÁO: Đơn hàng #" + orderEvent.get("orderId") + " đã được tạo thành công!");
        System.out.println("Tổng số tiền thanh toán dự kiến: " + orderEvent.get("total"));
        System.out.println("Email thông báo đã được gửi giả lập tới người dùng.");
        System.out.println("=================================================");
    }
}

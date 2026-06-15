package com.rainbowforest.notificationservice.consumer;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class NotificationEventConsumer {
    private final JavaMailSender mailSender;
    private final String smtpHost;
    private final String from;

    public NotificationEventConsumer(JavaMailSender mailSender,
            @Value("${spring.mail.host:}") String smtpHost,
            @Value("${app.mail.from:no-reply@highlands.local}") String from) {
        this.mailSender = mailSender;
        this.smtpHost = smtpHost;
        this.from = from;
    }

    @KafkaListener(topics = "order-events", groupId = "notification-group")
    public void consumeOrderEvent(Map<String, Object> event) {
        String email = value(event, "email");
        if (smtpHost.isBlank() || email.isBlank() || !email.contains("@")) {
            System.out.printf("Notification queued: type=%s order=%s recipient=%s%n",
                    value(event, "eventType"), value(event, "orderCode"), email);
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(email);
        message.setSubject(subject(event));
        message.setText(body(event));
        mailSender.send(message);
    }

    private String subject(Map<String, Object> event) {
        return "ORDER_CREATED".equals(value(event, "eventType"))
                ? "Đặt hàng thành công - " + value(event, "orderCode")
                : "Cập nhật đơn hàng - " + value(event, "orderCode");
    }

    private String body(Map<String, Object> event) {
        return "Xin chào " + value(event, "recipientName") + ",\n\n"
                + "Đơn hàng " + value(event, "orderCode") + " hiện có trạng thái: " + value(event, "status") + ".\n"
                + "Tổng thanh toán: " + value(event, "total") + " VNĐ.\n\n"
                + "Cảm ơn bạn đã đặt hàng.";
    }

    private String value(Map<String, Object> event, String key) {
        return event.get(key) == null ? "" : String.valueOf(event.get(key));
    }
}

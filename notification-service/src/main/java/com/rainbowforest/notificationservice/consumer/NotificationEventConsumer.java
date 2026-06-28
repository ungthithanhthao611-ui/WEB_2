package com.rainbowforest.notificationservice.consumer;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;
import java.util.Map;
import java.util.List;
import java.text.NumberFormat;
import java.util.Locale;

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
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(from);
            helper.setTo(email);
            helper.setSubject(subject(event));
            helper.setText(buildHtmlBody(event), true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    private String subject(Map<String, Object> event) {
        String type = value(event, "eventType");
        if ("ORDER_CREATED".equals(type)) return "Đặt hàng thành công - " + value(event, "orderCode");
        if ("ITEM_ISSUE_REPORTED".equals(type)) return "Sự cố đơn hàng: Báo thiếu món - " + value(event, "orderCode");
        return "Cập nhật đơn hàng - " + value(event, "orderCode");
    }

    private String buildHtmlBody(Map<String, Object> event) {
        NumberFormat nf = NumberFormat.getInstance(new Locale("vi", "VN"));
        String recipient = value(event, "recipientName");
        String orderCode = value(event, "orderCode");
        String status = value(event, "status");
        String total = formatMoney(event.get("total"), nf);
        String shipping = formatMoney(event.get("shippingFee"), nf);
        String discount = formatMoney(event.get("discount"), nf);

        StringBuilder html = new StringBuilder();
        html.append("<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;'>");
        
        String eventType = value(event, "eventType");
        if ("ITEM_ISSUE_REPORTED".equals(eventType)) {
            html.append("<div style='background-color: #ff9800; padding: 20px; text-align: center; color: white;'>");
            html.append("<h2 style='margin: 0;'>Sự Cố Đơn Hàng</h2>");
            html.append("<p style='margin: 5px 0 0 0;'>Cửa hàng đã báo lỗi một món trong đơn hàng của bạn</p>");
            html.append("</div>");
            html.append("<div style='padding: 20px;'>");
            html.append("<p>Xin chào <strong>").append(recipient).append("</strong>,</p>");
            html.append("<p>Rất tiếc, cửa hàng đã báo lỗi một số món trong đơn hàng <strong>").append(orderCode).append("</strong> của bạn.</p>");
            html.append("<p style='background: #fff3cd; padding: 10px; border-left: 4px solid #ffc107;'><strong>Vui lòng đăng nhập vào website và vào mục Lịch sử mua hàng để xác nhận tiếp tục mua các món còn lại hoặc hủy toàn bộ đơn.</strong></p>");
        } else {
            html.append("<div style='background-color: #e30613; padding: 20px; text-align: center; color: white;'>");
            html.append("<h2 style='margin: 0;'>Xác Nhận Đơn Hàng</h2>");
            html.append("<p style='margin: 5px 0 0 0;'>Cảm ơn bạn đã mua sắm tại Highlands Coffee</p>");
            html.append("</div>");
            html.append("<div style='padding: 20px;'>");
            html.append("<p>Xin chào <strong>").append(recipient).append("</strong>,</p>");
            html.append("<p>Đơn hàng <strong>").append(orderCode).append("</strong> của bạn hiện đang ở trạng thái: <span style='color: #e30613; font-weight: bold;'>").append(status).append("</span>.</p>");
        }
        
        html.append("<h3 style='border-bottom: 2px solid #eee; padding-bottom: 10px;'>Chi tiết đơn hàng</h3>");
        html.append("<table style='width: 100%; border-collapse: collapse; margin-bottom: 20px;'>");
        html.append("<thead><tr style='background-color: #f9f9f9; text-align: left;'>");
        html.append("<th style='padding: 10px; border: 1px solid #ddd;'>Sản phẩm</th>");
        html.append("<th style='padding: 10px; border: 1px solid #ddd; text-align: center;'>SL</th>");
        html.append("<th style='padding: 10px; border: 1px solid #ddd; text-align: right;'>Đơn giá</th>");
        html.append("<th style='padding: 10px; border: 1px solid #ddd; text-align: right;'>Thành tiền</th>");
        html.append("</tr></thead><tbody>");

        if (event.get("items") instanceof List) {
            List<Map<String, Object>> items = (List<Map<String, Object>>) event.get("items");
            for (Map<String, Object> item : items) {
                String name = value(item, "productName") + (item.get("size") != null ? " (" + item.get("size") + ")" : "");
                String qty = value(item, "quantity");
                String price = formatMoney(item.get("unitPrice"), nf);
                String sub = formatMoney(item.get("subTotal"), nf);
                
                html.append("<tr>");
                html.append("<td style='padding: 10px; border: 1px solid #ddd;'>").append(name).append("</td>");
                html.append("<td style='padding: 10px; border: 1px solid #ddd; text-align: center;'>").append(qty).append("</td>");
                html.append("<td style='padding: 10px; border: 1px solid #ddd; text-align: right;'>").append(price).append(" đ</td>");
                html.append("<td style='padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold;'>").append(sub).append(" đ</td>");
                html.append("</tr>");
            }
        }

        html.append("</tbody></table>");
        
        html.append("<table style='width: 100%; border-collapse: collapse;'>");
        html.append("<tr><td style='padding: 5px 0; text-align: right;'>Phí vận chuyển:</td><td style='padding: 5px 0; text-align: right; width: 120px;'>").append(shipping).append(" đ</td></tr>");
        html.append("<tr><td style='padding: 5px 0; text-align: right;'>Giảm giá:</td><td style='padding: 5px 0; text-align: right; color: #28a745;'>-").append(discount).append(" đ</td></tr>");
        html.append("<tr><td style='padding: 10px 0; text-align: right; font-weight: bold; font-size: 1.1em; border-top: 1px solid #ddd;'>Tổng thanh toán:</td><td style='padding: 10px 0; text-align: right; font-weight: bold; font-size: 1.2em; color: #e30613; border-top: 1px solid #ddd;'>").append(total).append(" đ</td></tr>");
        html.append("</table>");
        
        html.append("<p style='margin-top: 30px; font-size: 0.9em; color: #666;'>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ bộ phận hỗ trợ khách hàng của chúng tôi.</p>");
        html.append("</div></div>");
        
        return html.toString();
    }
    
    private String formatMoney(Object amount, NumberFormat nf) {
        if (amount == null) return "0";
        try {
            return nf.format(Double.parseDouble(amount.toString()));
        } catch (Exception e) {
            return "0";
        }
    }

    private String value(Map<String, Object> event, String key) {
        return event.get(key) == null ? "" : String.valueOf(event.get(key));
    }
}

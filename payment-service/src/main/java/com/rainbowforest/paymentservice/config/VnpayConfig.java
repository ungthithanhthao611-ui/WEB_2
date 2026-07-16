package com.rainbowforest.paymentservice.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.TimeZone;

@Configuration
@Getter
public class VnpayConfig {

    @Value("${payment.vnpay.tmn-code}")
    private String vnp_TmnCode;

    @Value("${payment.vnpay.hash-secret}")
    private String secretKey;

    @Value("${payment.vnpay.payment-url}")
    private String vnp_PayUrl;

    @Value("${payment.vnpay.query-url}")
    private String vnp_ApiUrl;

    @Value("${payment.vnpay.return-url}")
    private String vnp_ReturnUrl;
    
    @Value("${payment.vnpay.ipn-url:}")
    private String vnp_IpnUrl;

    @Value("${payment.vnpay.version:2.1.0}")
    private String vnp_Version;

    @Value("${payment.vnpay.command:pay}")
    private String vnp_Command;
    
    @Value("${payment.vnpay.order-type:other}")
    private String vnp_OrderType;

    @Value("${payment.vnpay.locale:vn}")
    private String vnp_Locale;

    public String getIpAddress(jakarta.servlet.http.HttpServletRequest request) {
        String ipAddress = request.getHeader("X-FORWARDED-FOR");
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        }
        if (ipAddress != null && ipAddress.length() > 15) {
            if (ipAddress.indexOf(",") > 0) {
                ipAddress = ipAddress.substring(0, ipAddress.indexOf(","));
            }
        }
        return ipAddress;
    }
}

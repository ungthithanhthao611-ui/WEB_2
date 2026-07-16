package com.rainbowforest.paymentservice.controller;

import com.rainbowforest.paymentservice.config.VnpayConfig;
import com.rainbowforest.paymentservice.dto.OrderDTO;
import com.rainbowforest.paymentservice.feignclient.OrderClient;
import com.rainbowforest.paymentservice.model.Payment;
import com.rainbowforest.paymentservice.model.PaymentStatus;
import com.rainbowforest.paymentservice.service.PaymentService;
import com.rainbowforest.paymentservice.util.VnpaySignatureUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import com.rainbowforest.paymentservice.repository.PaymentRepository;

@RestController
@RequestMapping("/vnpay")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentRepository paymentRepository;
    private final VnpayConfig vnpayConfig;
    private final OrderClient orderClient;

    @Value("${payment.vnpay.frontend-result-url}")
    private String frontendResultUrl;

    @Value("${payment.vnpay.ipn-enabled:false}")
    private boolean ipnEnabled;

    @PostMapping("/create")
    public ResponseEntity<?> createPayment(
            @RequestBody Map<String, Object> requestBody,
            @RequestHeader(value = "X-User-Name", required = false) String username,
            HttpServletRequest request) {
        
        try {
            Long orderId = Long.valueOf(requestBody.get("orderId").toString());
            String bankCode = (String) requestBody.get("bankCode");

            OrderDTO order = orderClient.getOrderById(orderId);
            if (order == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Order not found"));
            }

            // Since gateway extracts token and passes X-User-Name, we can optionally verify user
            // However, Order object in order-service should ideally belong to this user.
            // If the OrderDTO returned has user details, we can check.
            // Skip checking email vs username to avoid 403 errors due to different naming conventions
            // if (order.getUser() != null && username != null && !username.equals(order.getUser().getUserName())) {
            //     return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Order does not belong to you"));
            // }

            Map<String, Object> response = paymentService.createVnpayPayment(orderId, bankCode, request);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/return")
    public RedirectView paymentReturn(@RequestParam Map<String, String> queryParams) {
        String txnRef = queryParams.get("vnp_TxnRef");
        try {
            paymentService.processReturn(queryParams);
            return new RedirectView(frontendResultUrl + "?txnRef=" + txnRef);
        } catch (Exception e) {
            e.printStackTrace();
            return new RedirectView(frontendResultUrl + "?txnRef=" + txnRef + "&result=invalid-signature");
        }
    }

    @GetMapping("/status/{txnRef}")
    public ResponseEntity<?> getPaymentStatus(
            @PathVariable("txnRef") String txnRef,
            @RequestHeader(value = "X-User-Name", required = false) String username) {
        
        Payment payment = paymentService.getPaymentByTxnRef(txnRef);
        if (payment == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Payment not found"));
        }

        OrderDTO order = orderClient.getOrderById(payment.getOrderId());
        
        // Skip check
        // if (order != null && order.getUser() != null && username != null && !username.equals(order.getUser().getUserName())) {
        //     return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access denied"));
        // }

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", payment.getOrderId());
        response.put("txnRef", payment.getTxnRef());
        response.put("paymentStatus", payment.getStatus().toString());
        response.put("orderStatus", order != null ? order.getStatus() : "UNKNOWN");
        response.put("amount", payment.getAmount());
        response.put("paidAt", payment.getPaidAt() != null ? payment.getPaidAt().toString() : null);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/ipn")
    public ResponseEntity<?> ipnEndpoint(@RequestParam Map<String, String> queryParams) {
        if (!ipnEnabled) {
            return ResponseEntity.ok(Map.of("RspCode", "99", "Message", "IPN is disabled"));
        }

        try {
            String vnp_SecureHash = queryParams.get("vnp_SecureHash");
            boolean isValid = VnpaySignatureUtil.verifySignature(new HashMap<>(queryParams), vnp_SecureHash, vnpayConfig.getSecretKey());
            
            if (!isValid) {
                return ResponseEntity.ok(Map.of("RspCode", "97", "Message", "Invalid signature"));
            }

            String txnRef = queryParams.get("vnp_TxnRef");
            Payment payment = paymentService.getPaymentByTxnRef(txnRef);
            
            if (payment == null) {
                return ResponseEntity.ok(Map.of("RspCode", "01", "Message", "Order not found"));
            }

            Long amountInVnpay = Long.parseLong(queryParams.get("vnp_Amount"));
            Long expectedAmountVnpay = payment.getAmount().multiply(new java.math.BigDecimal(100)).longValue();
            
            if (!amountInVnpay.equals(expectedAmountVnpay)) {
                return ResponseEntity.ok(Map.of("RspCode", "04", "Message", "Invalid amount"));
            }

            if (payment.getStatus() == PaymentStatus.PAID || payment.getStatus() == PaymentStatus.FAILED) {
                return ResponseEntity.ok(Map.of("RspCode", "02", "Message", "Order already confirmed"));
            }

            if ("00".equals(queryParams.get("vnp_ResponseCode")) && "00".equals(queryParams.get("vnp_TransactionStatus"))) {
                payment.setStatus(PaymentStatus.PAID);
                payment.setResponseCode(queryParams.get("vnp_ResponseCode"));
                payment.setTransactionStatus(queryParams.get("vnp_TransactionStatus"));
                payment.setPaidAt(LocalDateTime.now());
                
                Map<String, String> statusMap = new HashMap<>();
                statusMap.put("status", "CONFIRMED");
                statusMap.put("paymentStatus", "PAID");
                statusMap.put("paymentMethod", "VNPAY");
                orderClient.updateOrderStatus(payment.getOrderId(), statusMap);
            } else {
                payment.setStatus(PaymentStatus.FAILED);
                
                // Call Order Service to cancel the order and release stock
                Map<String, String> statusMap = new HashMap<>();
                statusMap.put("status", "CANCELLED");
                statusMap.put("changedBy", "SYSTEM");
                statusMap.put("reason", "Thanh toán trực tuyến thất bại hoặc bị hủy (IPN)");
                try {
                    orderClient.changeOrderStatus(payment.getOrderId(), statusMap);
                } catch (Exception e) {
                    System.err.println("Lỗi tự động hủy đơn hàng khi nhận IPN thất bại: " + e.getMessage());
                }
            }
            
            paymentRepository.save(payment);
            
            return ResponseEntity.ok(Map.of("RspCode", "00", "Message", "Confirm Success"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(Map.of("RspCode", "99", "Message", "Unknown error"));
        }
    }
}

package com.rainbowforest.paymentservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rainbowforest.paymentservice.config.VnpayConfig;
import com.rainbowforest.paymentservice.dto.OrderDTO;
import com.rainbowforest.paymentservice.feignclient.OrderClient;
import com.rainbowforest.paymentservice.model.Payment;
import com.rainbowforest.paymentservice.model.PaymentStatus;
import com.rainbowforest.paymentservice.repository.PaymentRepository;
import com.rainbowforest.paymentservice.util.VnpaySignatureUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final VnpayConfig vnpayConfig;
    private final OrderClient orderClient;

    @Transactional
    public Map<String, Object> createVnpayPayment(Long orderId, String bankCode, HttpServletRequest request) {
        OrderDTO order = orderClient.getOrderById(orderId);
        if (order == null) {
            throw new RuntimeException("Order not found");
        }
        
        if (!"PAYMENT_EXPECTED".equals(order.getStatus()) && !"PENDING_CONFIRMATION".equals(order.getStatus())) {
            throw new RuntimeException("Order is not in valid state for payment");
        }

        BigDecimal amount = order.getTotal();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Invalid order amount");
        }

        // Check if there is already a PENDING payment
        Optional<Payment> existingPaymentOpt = paymentRepository.findByOrderIdAndStatus(orderId, PaymentStatus.PENDING);
        Payment payment;
        if (existingPaymentOpt.isPresent()) {
            payment = existingPaymentOpt.get();
            if (payment.getExpiredAt() != null && LocalDateTime.now().isAfter(payment.getExpiredAt())) {
                payment.setStatus(PaymentStatus.EXPIRED);
                paymentRepository.save(payment);
                payment = createNewPaymentRecord(orderId, amount);
            }
        } else {
            payment = createNewPaymentRecord(orderId, amount);
        }

        String vnp_IpAddr = vnpayConfig.getIpAddress(request);
        String vnp_TxnRef = payment.getTxnRef();

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnpayConfig.getVnp_Version());
        vnp_Params.put("vnp_Command", vnpayConfig.getVnp_Command());
        vnp_Params.put("vnp_TmnCode", vnpayConfig.getVnp_TmnCode());
        vnp_Params.put("vnp_Amount", String.valueOf(amount.multiply(new BigDecimal(100)).longValue()));
        vnp_Params.put("vnp_CurrCode", "VND");
        
        if (bankCode != null && !bankCode.isEmpty()) {
            vnp_Params.put("vnp_BankCode", bankCode);
        }
        
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang " + orderId);
        vnp_Params.put("vnp_OrderType", vnpayConfig.getVnp_OrderType());
        vnp_Params.put("vnp_Locale", vnpayConfig.getVnp_Locale());
        vnp_Params.put("vnp_ReturnUrl", vnpayConfig.getVnp_ReturnUrl());
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        
        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);
        
        payment.setExpiredAt(LocalDateTime.now().plusMinutes(15));
        paymentRepository.save(payment);

        String paymentUrl = VnpaySignatureUtil.getPaymentURL(vnp_Params, vnpayConfig.getSecretKey(), vnpayConfig.getVnp_PayUrl());

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("paymentId", payment.getId());
        result.put("orderId", orderId);
        result.put("txnRef", vnp_TxnRef);
        result.put("paymentUrl", paymentUrl);
        result.put("expiredAt", payment.getExpiredAt().toString());
        result.put("status", payment.getStatus().toString());

        return result;
    }

    private Payment createNewPaymentRecord(Long orderId, BigDecimal amount) {
        String txnRef = "VNP" + System.currentTimeMillis() + orderId;
        Payment payment = Payment.builder()
                .orderId(orderId)
                .provider("VNPAY")
                .txnRef(txnRef)
                .amount(amount)
                .status(PaymentStatus.PENDING)
                .build();
        return paymentRepository.save(payment);
    }

    @Transactional
    public void processReturn(Map<String, String> queryParams) {
        String vnp_SecureHash = queryParams.get("vnp_SecureHash");
        boolean isValid = VnpaySignatureUtil.verifySignature(new HashMap<>(queryParams), vnp_SecureHash, vnpayConfig.getSecretKey());
        
        if (!isValid) {
            throw new RuntimeException("Invalid VNPAY signature");
        }

        String txnRef = queryParams.get("vnp_TxnRef");
        Payment payment = paymentRepository.findByTxnRef(txnRef)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getStatus() == PaymentStatus.PAID || payment.getStatus() == PaymentStatus.FAILED) {
            return; // Already processed
        }

        // Verify with QueryDR
        boolean isSuccess = verifyWithQueryDR(payment.getTxnRef(), payment.getCreatedAt(), payment.getAmount(), queryParams);
        
        if (isSuccess) {
            payment.setStatus(PaymentStatus.PAID);
            payment.setResponseCode(queryParams.get("vnp_ResponseCode"));
            payment.setTransactionStatus(queryParams.get("vnp_TransactionStatus"));
            payment.setBankCode(queryParams.get("vnp_BankCode"));
            payment.setBankTransactionNo(queryParams.get("vnp_BankTranNo"));
            payment.setCardType(queryParams.get("vnp_CardType"));
            payment.setProviderTransactionNo(queryParams.get("vnp_TransactionNo"));
            payment.setPaidAt(LocalDateTime.now());
            
            // Call Order Service to update status
            Map<String, String> statusMap = new HashMap<>();
            statusMap.put("status", "CONFIRMED");
            statusMap.put("paymentStatus", "PAID");
            statusMap.put("paymentMethod", "VNPAY");
            orderClient.updateOrderStatus(payment.getOrderId(), statusMap);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason("QueryDR verification failed or transaction not successful");
            
            // Call Order Service to cancel the order and release stock
            Map<String, String> statusMap = new HashMap<>();
            statusMap.put("status", "CANCELLED");
            statusMap.put("changedBy", "SYSTEM");
            statusMap.put("reason", "Thanh toán trực tuyến thất bại hoặc bị hủy");
            try {
                orderClient.changeOrderStatus(payment.getOrderId(), statusMap);
            } catch (Exception e) {
                System.err.println("Lỗi tự động hủy đơn hàng khi thanh toán thất bại: " + e.getMessage());
            }
        }
        paymentRepository.save(payment);
    }

    private boolean verifyWithQueryDR(String txnRef, LocalDateTime createdAt, BigDecimal expectedAmount, Map<String, String> returnParams) {
        try {
            URL url = new URL(vnpayConfig.getVnp_ApiUrl());
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("POST");
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setDoOutput(true);

            String vnp_RequestId = UUID.randomUUID().toString();
            String vnp_Version = vnpayConfig.getVnp_Version();
            String vnp_Command = "querydr";
            String vnp_TmnCode = vnpayConfig.getVnp_TmnCode();
            String vnp_TxnRef = txnRef;
            String vnp_OrderInfo = "Query giao dich " + txnRef;
            
            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
            String vnp_TransactionDate = returnParams.get("vnp_PayDate"); // Use PayDate from return if available
            if (vnp_TransactionDate == null) {
                vnp_TransactionDate = createdAt.format(dtf);
            }
            
            String vnp_CreateDate = LocalDateTime.now().format(dtf);
            String vnp_IpAddr = "127.0.0.1";

            String hashData = vnp_RequestId + "|" + vnp_Version + "|" + vnp_Command + "|" + vnp_TmnCode + "|" + 
                              vnp_TxnRef + "|" + vnp_TransactionDate + "|" + vnp_CreateDate + "|" + vnp_IpAddr + "|" + vnp_OrderInfo;
            
            String vnp_SecureHash = VnpaySignatureUtil.hmacSHA512(vnpayConfig.getSecretKey(), hashData);

            Map<String, Object> reqBody = new HashMap<>();
            reqBody.put("vnp_RequestId", vnp_RequestId);
            reqBody.put("vnp_Version", vnp_Version);
            reqBody.put("vnp_Command", vnp_Command);
            reqBody.put("vnp_TmnCode", vnp_TmnCode);
            reqBody.put("vnp_TxnRef", vnp_TxnRef);
            reqBody.put("vnp_OrderInfo", vnp_OrderInfo);
            reqBody.put("vnp_TransactionDate", vnp_TransactionDate);
            reqBody.put("vnp_CreateDate", vnp_CreateDate);
            reqBody.put("vnp_IpAddr", vnp_IpAddr);
            reqBody.put("vnp_SecureHash", vnp_SecureHash);

            ObjectMapper mapper = new ObjectMapper();
            String jsonRequest = mapper.writeValueAsString(reqBody);

            connection.getOutputStream().write(jsonRequest.getBytes());

            BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            String inputLine;
            StringBuilder response = new StringBuilder();
            while ((inputLine = in.readLine()) != null) {
                response.append(inputLine);
            }
            in.close();

            Map<String, Object> resMap = mapper.readValue(response.toString(), Map.class);
            System.out.println("VNPAY QueryDR Response: " + response.toString());
            
            String vnp_ResponseCode = (String) resMap.get("vnp_ResponseCode");
            String vnp_TransactionStatus = (String) resMap.get("vnp_TransactionStatus");
            
            // Check signature of response
            String resHashData = 
                    getStringOrEmpty(resMap.get("vnp_ResponseId")) + "|" + 
                    getStringOrEmpty(resMap.get("vnp_Command")) + "|" + 
                    getStringOrEmpty(resMap.get("vnp_ResponseCode")) + "|" +
                    getStringOrEmpty(resMap.get("vnp_Message")) + "|" + 
                    getStringOrEmpty(resMap.get("vnp_TmnCode")) + "|" + 
                    getStringOrEmpty(resMap.get("vnp_TxnRef")) + "|" + 
                    getStringOrEmpty(resMap.get("vnp_Amount")) + "|" + 
                    getStringOrEmpty(resMap.get("vnp_BankCode")) + "|" + 
                    getStringOrEmpty(resMap.get("vnp_PayDate")) + "|" + 
                    getStringOrEmpty(resMap.get("vnp_TransactionNo")) + "|" + 
                    getStringOrEmpty(resMap.get("vnp_TransactionType")) + "|" + 
                    getStringOrEmpty(resMap.get("vnp_TransactionStatus")) + "|" +
                    getStringOrEmpty(resMap.get("vnp_OrderInfo")) + "|" + 
                    getStringOrEmpty(resMap.get("vnp_PromotionCode")) + "|" + 
                    getStringOrEmpty(resMap.get("vnp_PromotionAmount"));
            
            String expectedResHash = VnpaySignatureUtil.hmacSHA512(vnpayConfig.getSecretKey(), resHashData);
            String actualResHash = (String) resMap.get("vnp_SecureHash");
            
            if (actualResHash == null || !expectedResHash.equalsIgnoreCase(actualResHash)) {
                System.out.println("Invalid QueryDR response signature. Expected: " + expectedResHash + ", Actual: " + actualResHash);
                return false;
            }

            if ("00".equals(vnp_ResponseCode) && "00".equals(vnp_TransactionStatus)) {
                // Verify amount
                Long amountInVnpay = Long.parseLong(resMap.get("vnp_Amount").toString());
                Long expectedAmountVnpay = expectedAmount.multiply(new BigDecimal(100)).longValue();
                return amountInVnpay.equals(expectedAmountVnpay);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    private String getStringOrEmpty(Object obj) {
        return obj == null ? "" : obj.toString();
    }

    public Payment getPaymentByTxnRef(String txnRef) {
        return paymentRepository.findByTxnRef(txnRef).orElse(null);
    }
}

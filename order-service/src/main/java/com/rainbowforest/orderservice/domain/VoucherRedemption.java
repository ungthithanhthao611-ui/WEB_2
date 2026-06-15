package com.rainbowforest.orderservice.domain;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Entity @Table(name="voucher_redemptions")
public class VoucherRedemption {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 private Long voucherId; private String voucherCode; private Long userId; private Long orderId; private BigDecimal discountAmount; private LocalDateTime redeemedAt;
 public Long getId(){return id;} public Long getVoucherId(){return voucherId;} public void setVoucherId(Long v){voucherId=v;} public String getVoucherCode(){return voucherCode;} public void setVoucherCode(String v){voucherCode=v;}
 public Long getUserId(){return userId;} public void setUserId(Long v){userId=v;} public Long getOrderId(){return orderId;} public void setOrderId(Long v){orderId=v;}
 public BigDecimal getDiscountAmount(){return discountAmount;} public void setDiscountAmount(BigDecimal v){discountAmount=v;} public LocalDateTime getRedeemedAt(){return redeemedAt;} public void setRedeemedAt(LocalDateTime v){redeemedAt=v;}
}

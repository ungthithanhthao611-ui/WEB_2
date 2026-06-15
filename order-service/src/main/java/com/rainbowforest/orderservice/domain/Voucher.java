package com.rainbowforest.orderservice.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name="vouchers")
public class Voucher {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(unique=true,nullable=false) @NotBlank private String code;
 @NotBlank private String title;
 @NotBlank private String type;
 @Positive private BigDecimal value;
 private BigDecimal minOrder=BigDecimal.ZERO;
 private BigDecimal maxDiscount=BigDecimal.ZERO;
 private LocalDateTime startsAt;
 private LocalDateTime expiresAt;
 private Integer usageLimit;
 private Integer perUserLimit=1;
 private Integer usedCount=0;
 private BigDecimal budget;
 private String audience="ALL";
 private String applicableCategory;
 private Long applicableProductId;
 private boolean active=true;
 public Long getId(){return id;} public void setId(Long v){id=v;}
 public String getCode(){return code;} public void setCode(String v){code=v;}
 public String getTitle(){return title;} public void setTitle(String v){title=v;}
 public String getType(){return type;} public void setType(String v){type=v;}
 public BigDecimal getValue(){return value;} public void setValue(BigDecimal v){value=v;}
 public BigDecimal getMinOrder(){return minOrder;} public void setMinOrder(BigDecimal v){minOrder=v;}
 public BigDecimal getMaxDiscount(){return maxDiscount;} public void setMaxDiscount(BigDecimal v){maxDiscount=v;}
 public LocalDateTime getStartsAt(){return startsAt;} public void setStartsAt(LocalDateTime v){startsAt=v;}
 public LocalDateTime getExpiresAt(){return expiresAt;} public void setExpiresAt(LocalDateTime v){expiresAt=v;}
 public Integer getUsageLimit(){return usageLimit;} public void setUsageLimit(Integer v){usageLimit=v;}
 public Integer getPerUserLimit(){return perUserLimit;} public void setPerUserLimit(Integer v){perUserLimit=v;}
 public Integer getUsedCount(){return usedCount;} public void setUsedCount(Integer v){usedCount=v;}
 public BigDecimal getBudget(){return budget;} public void setBudget(BigDecimal v){budget=v;}
 public String getAudience(){return audience;} public void setAudience(String v){audience=v;}
 public String getApplicableCategory(){return applicableCategory;} public void setApplicableCategory(String v){applicableCategory=v;}
 public Long getApplicableProductId(){return applicableProductId;} public void setApplicableProductId(Long v){applicableProductId=v;}
 public boolean isActive(){return active;} public void setActive(boolean v){active=v;}
}

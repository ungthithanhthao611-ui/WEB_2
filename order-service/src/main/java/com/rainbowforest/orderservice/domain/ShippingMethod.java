package com.rainbowforest.orderservice.domain;
import jakarta.persistence.*;
import java.math.BigDecimal;
@Entity @Table(name="shipping_methods")
public class ShippingMethod {
 @Id private String id; @Column(nullable=false) private String name; private BigDecimal fee; private String eta; private boolean active=true;
 public String getId(){return id;} public void setId(String v){id=v;} public String getName(){return name;} public void setName(String v){name=v;} public BigDecimal getFee(){return fee;} public void setFee(BigDecimal v){fee=v;} public String getEta(){return eta;} public void setEta(String v){eta=v;} public boolean isActive(){return active;} public void setActive(boolean v){active=v;}
}

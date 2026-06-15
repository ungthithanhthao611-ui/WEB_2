package com.rainbowforest.orderservice.domain;
import jakarta.persistence.*;
@Entity @Table(name="store_locations")
public class StoreLocation {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @Column(nullable=false,unique=true) private String name; private String district; private String address; private String openTime="08:00"; private String closeTime="22:00"; private boolean active=true;
 public Long getId(){return id;} public void setId(Long v){id=v;} public String getName(){return name;} public void setName(String v){name=v;} public String getDistrict(){return district;} public void setDistrict(String v){district=v;} public String getAddress(){return address;} public void setAddress(String v){address=v;} public String getOpenTime(){return openTime;} public void setOpenTime(String v){openTime=v;} public String getCloseTime(){return closeTime;} public void setCloseTime(String v){closeTime=v;} public boolean isActive(){return active;} public void setActive(boolean v){active=v;}
}

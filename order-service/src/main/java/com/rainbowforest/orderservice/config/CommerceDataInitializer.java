package com.rainbowforest.orderservice.config;
import com.rainbowforest.orderservice.domain.*; import com.rainbowforest.orderservice.repository.*; import org.springframework.boot.ApplicationArguments; import org.springframework.boot.ApplicationRunner; import org.springframework.stereotype.Component; import java.math.BigDecimal; import java.util.List;
@Component public class CommerceDataInitializer implements ApplicationRunner {
 private final StoreLocationRepository stores; private final ShippingMethodRepository methods;
 public CommerceDataInitializer(StoreLocationRepository s,ShippingMethodRepository m){stores=s;methods=m;}
 public void run(ApplicationArguments args){
  if(stores.count()==0){stores.saveAll(List.of(store("Highlands Nguyễn Huệ - Quận 1","Quận 1"),store("Highlands Landmark 81 - Bình Thạnh","Bình Thạnh"),store("Highlands Phan Xích Long - Phú Nhuận","Phú Nhuận")));}
  if(methods.count()==0){methods.saveAll(List.of(method("express","Giao hỏa tốc",30000,"30 - 45 phút"),method("standard","Giao thường",15000,"60 - 90 phút")));}
 }
 private StoreLocation store(String name,String district){StoreLocation s=new StoreLocation();s.setName(name);s.setDistrict(district);s.setAddress(name);return s;}
 private ShippingMethod method(String id,String name,long fee,String eta){ShippingMethod m=new ShippingMethod();m.setId(id);m.setName(name);m.setFee(BigDecimal.valueOf(fee));m.setEta(eta);return m;}
}

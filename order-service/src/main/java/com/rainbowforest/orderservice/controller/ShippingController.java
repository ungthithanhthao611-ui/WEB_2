package com.rainbowforest.orderservice.controller;
import com.rainbowforest.orderservice.domain.*; import com.rainbowforest.orderservice.repository.*; import org.springframework.web.bind.annotation.*; import java.util.*;
@RestController public class ShippingController {
 private final StoreLocationRepository stores; private final ShippingMethodRepository methods;
 public ShippingController(StoreLocationRepository s,ShippingMethodRepository m){stores=s;methods=m;}
 @GetMapping("/shipping/config") public Map<String,Object> config(){return Map.of("stores",stores.findAll().stream().filter(StoreLocation::isActive).toList(),"methods",methods.findAll().stream().filter(ShippingMethod::isActive).toList());}
 @GetMapping("/admin/shipping/config") public Map<String,Object> adminConfig(){return Map.of("stores",stores.findAll(),"methods",methods.findAll());}
 @PutMapping("/admin/shipping/config") public Map<String,Object> save(@RequestBody ShippingConfig body){stores.deleteAll();methods.deleteAll();stores.saveAll(body.stores());methods.saveAll(body.methods());return adminConfig();}
 public record ShippingConfig(List<StoreLocation> stores,List<ShippingMethod> methods){}
}

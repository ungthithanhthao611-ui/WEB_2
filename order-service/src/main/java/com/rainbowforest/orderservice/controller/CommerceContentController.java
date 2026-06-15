package com.rainbowforest.orderservice.controller;

import com.rainbowforest.orderservice.domain.*;
import com.rainbowforest.orderservice.repository.*;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
public class CommerceContentController {
 private final VoucherRepository vouchers; private final BannerRepository banners; private final SupportTicketRepository tickets; private final OrderRepository orders;
 public CommerceContentController(VoucherRepository v,BannerRepository b,SupportTicketRepository t,OrderRepository o){vouchers=v;banners=b;tickets=t;orders=o;}

 @GetMapping("/vouchers") public List<Voucher> publicVouchers(){LocalDateTime now=LocalDateTime.now();return vouchers.findAll().stream().filter(v->v.isActive()&&(v.getStartsAt()==null||!v.getStartsAt().isAfter(now))&&(v.getExpiresAt()==null||!v.getExpiresAt().isBefore(now))&&(v.getUsageLimit()==null||v.getUsedCount()<v.getUsageLimit())).toList();}
 @GetMapping("/admin/vouchers") public List<Voucher> allVouchers(){return vouchers.findAll();}
 @PostMapping("/admin/vouchers") public Voucher saveVoucher(@Valid @RequestBody Voucher v){v.setCode(v.getCode().trim().toUpperCase());Voucher existing=v.getId()==null?vouchers.findByCodeIgnoreCase(v.getCode()).orElse(null):null;if(existing!=null)throw new IllegalArgumentException("Mã voucher đã tồn tại");return vouchers.save(v);}
 @PutMapping("/admin/vouchers/{id}") public Voucher updateVoucher(@PathVariable Long id,@Valid @RequestBody Voucher v){v.setId(id);v.setCode(v.getCode().trim().toUpperCase());return vouchers.save(v);}
 @DeleteMapping("/admin/vouchers/{id}") public void deleteVoucher(@PathVariable Long id){vouchers.deleteById(id);}

 @GetMapping("/banners") public List<Banner> publicBanners(){LocalDateTime now=LocalDateTime.now();return banners.findAllByOrderBySortOrderAsc().stream().filter(b->b.isActive()&&(b.getStartsAt()==null||!b.getStartsAt().isAfter(now))&&(b.getEndsAt()==null||!b.getEndsAt().isBefore(now))).toList();}
 @GetMapping("/admin/banners") public List<Banner> allBanners(){return banners.findAllByOrderBySortOrderAsc();}
 @PostMapping("/admin/banners") public Banner saveBanner(@RequestBody Banner b){return banners.save(b);}
 @PutMapping("/admin/banners/{id}") public Banner updateBanner(@PathVariable Long id,@RequestBody Banner b){b.setId(id);return banners.save(b);}
 @DeleteMapping("/admin/banners/{id}") public void deleteBanner(@PathVariable Long id){banners.deleteById(id);}
 @PostMapping(value="/admin/banners/upload",consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
 public Map<String,String> upload(@RequestPart("file") MultipartFile file) throws IOException {if(file.isEmpty()||file.getContentType()==null||!file.getContentType().startsWith("image/"))throw new IllegalArgumentException("File ảnh không hợp lệ");if(file.getSize()>5*1024*1024)throw new IllegalArgumentException("Ảnh tối đa 5MB");String ext=Optional.ofNullable(file.getOriginalFilename()).filter(n->n.contains(".")).map(n->n.substring(n.lastIndexOf('.'))).orElse(".jpg");String name=UUID.randomUUID()+ext;Path dir=Paths.get("uploads","banners");Files.createDirectories(dir);Files.copy(file.getInputStream(),dir.resolve(name),StandardCopyOption.REPLACE_EXISTING);return Map.of("url","/api/shop/media/banners/"+name);}
 @GetMapping(value="/media/banners/{name}") public ResponseEntity<byte[]> media(@PathVariable String name)throws IOException {Path file=Paths.get("uploads","banners").resolve(Paths.get(name).getFileName());if(!Files.exists(file))return ResponseEntity.notFound().build();return ResponseEntity.ok().contentType(MediaType.parseMediaType(Files.probeContentType(file))).body(Files.readAllBytes(file));}

 @PostMapping("/support") public SupportTicket createTicket(@RequestBody SupportTicket t){
  if("COMPLAINT".equals(t.getTopic())){Order order=orders.findById(t.getOrderId()).orElseThrow(()->new IllegalArgumentException("Không tìm thấy đơn hàng"));if(!"COMPLETED".equals(order.getStatus()))throw new IllegalArgumentException("Chỉ có thể khiếu nại đơn đã giao");if(order.getCreatedAt()!=null&&order.getCreatedAt().isBefore(LocalDateTime.now().minusDays(7)))throw new IllegalArgumentException("Đơn hàng đã quá thời hạn khiếu nại 7 ngày");}
  t.setId(null);t.setTicketCode("SUP-"+UUID.randomUUID().toString().substring(0,8).toUpperCase());t.setStatus("NEW");t.setCreatedAt(LocalDateTime.now());t.setUpdatedAt(LocalDateTime.now());t.setDueAt(LocalDateTime.now().plusHours(24));return tickets.save(t);}
 @GetMapping("/support/user/{userId}") public List<SupportTicket> userTickets(@PathVariable Long userId){return tickets.findByUserIdOrderByCreatedAtDesc(userId);}
 @GetMapping("/admin/support") public List<SupportTicket> allTickets(){return tickets.findAll();}
 @PutMapping("/admin/support/{id}") public SupportTicket updateTicket(@PathVariable Long id,@RequestBody Map<String,Object> changes){SupportTicket t=tickets.findById(id).orElseThrow();if(changes.containsKey("status"))t.setStatus(String.valueOf(changes.get("status")));if(changes.containsKey("priority"))t.setPriority(String.valueOf(changes.get("priority")));if(changes.containsKey("assignedTo"))t.setAssignedTo(String.valueOf(changes.get("assignedTo")));if(changes.containsKey("adminResponse"))t.setAdminResponse(String.valueOf(changes.get("adminResponse")));if(changes.containsKey("resolution"))t.setResolution(String.valueOf(changes.get("resolution")));t.setUpdatedAt(LocalDateTime.now());return tickets.save(t);}
}

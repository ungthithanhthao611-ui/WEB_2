package com.rainbowforest.orderservice.service;

import com.rainbowforest.orderservice.domain.*;
import com.rainbowforest.orderservice.dto.CheckoutItemRequest;
import com.rainbowforest.orderservice.dto.CheckoutRequest;
import com.rainbowforest.orderservice.feignclient.UserClient;
import com.rainbowforest.orderservice.feignclient.ProductClient;
import com.rainbowforest.orderservice.dto.InventoryItemRequest;
import com.rainbowforest.orderservice.repository.OrderRepository;
import jakarta.transaction.Transactional;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class CheckoutService {
    private static final Logger log = LoggerFactory.getLogger(CheckoutService.class);

    @org.springframework.beans.factory.annotation.Autowired
    private com.rainbowforest.orderservice.controller.SseController sseController;
    private final OrderRepository orderRepository;
    private final UserClient userClient;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ProductClient productClient;
    private final com.rainbowforest.orderservice.repository.VoucherRepository voucherRepository;
    private final com.rainbowforest.orderservice.repository.VoucherRedemptionRepository redemptionRepository;
    private final com.rainbowforest.orderservice.repository.StoreLocationRepository storeRepository;
    private final com.rainbowforest.orderservice.repository.ShippingMethodRepository shippingMethodRepository;
    private final com.rainbowforest.orderservice.repository.UserRepository orderUserRepository;

    public CheckoutService(OrderRepository orderRepository, UserClient userClient, KafkaTemplate<String, Object> kafkaTemplate, ProductClient productClient,
            com.rainbowforest.orderservice.repository.VoucherRepository voucherRepository,
            com.rainbowforest.orderservice.repository.VoucherRedemptionRepository redemptionRepository,
            com.rainbowforest.orderservice.repository.StoreLocationRepository storeRepository,
            com.rainbowforest.orderservice.repository.ShippingMethodRepository shippingMethodRepository,
            com.rainbowforest.orderservice.repository.UserRepository orderUserRepository) {
        this.orderRepository = orderRepository;
        this.userClient = userClient;
        this.kafkaTemplate = kafkaTemplate;
        this.productClient = productClient;
        this.voucherRepository = voucherRepository;
        this.redemptionRepository = redemptionRepository;
        this.storeRepository = storeRepository;
        this.shippingMethodRepository = shippingMethodRepository;
        this.orderUserRepository = orderUserRepository;
    }

    @Transactional
    public Order checkout(CheckoutRequest request, String idempotencyKey) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            throw new IllegalArgumentException("Thiếu Idempotency-Key");
        }
        Optional<Order> existing = orderRepository.findByIdempotencyKey(idempotencyKey);
        if (existing.isPresent()) return existing.get();

        User remoteUser = userClient.getUserById(request.userId());
        if (remoteUser == null) throw new IllegalArgumentException("Tài khoản không tồn tại");
        User user = orderUserRepository.findById(request.userId()).orElseGet(() -> {
            User created = new User();
            created.setId(request.userId());
            created.setUserName(remoteUser.getUserName());
            return orderUserRepository.save(created);
        });
        if (!Objects.equals(user.getUserName(), remoteUser.getUserName())) {
            user.setUserName(remoteUser.getUserName());
            user = orderUserRepository.save(user);
        }

        List<InventoryItemRequest> inventory = request.items().stream().map(i -> new InventoryItemRequest(i.productId(), i.sku(), i.quantity(), i.unitPrice())).toList();
        List<Item> items = request.items().stream().map(this::toItem).toList();
        BigDecimal subtotal = items.stream().map(Item::getSubTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        StoreLocation selectedStore = storeRepository.findByNameAndActiveTrue(request.store().trim())
                .or(() -> storeRepository.findByNameIgnoreCaseAndActiveTrue(request.store().trim()))
                .orElseGet(() -> {
                    StoreLocation newStore = new StoreLocation();
                    newStore.setName(request.store().trim());
                    newStore.setDistrict(request.district() != null ? request.district() : "Unknown");
                    newStore.setAddress(request.store().trim());
                    newStore.setActive(true);
                    return storeRepository.save(newStore);
                });
        ShippingMethod shipping = shippingMethodRepository.findById(request.shippingMethod()).filter(ShippingMethod::isActive).orElseThrow(() -> new IllegalArgumentException("Hình thức giao hàng không hợp lệ"));
        BigDecimal verifiedShippingFee = shipping.getFee() == null ? BigDecimal.ZERO : shipping.getFee();
        Voucher voucher = validateVoucher(request.voucherCode(), request.userId(), subtotal);
        BigDecimal discount = calculateDiscount(voucher, subtotal, verifiedShippingFee);
        BigDecimal total = subtotal.add(verifiedShippingFee).subtract(discount).max(BigDecimal.ZERO);

        Order order = new Order();
        order.setOrderCode(generateOrderCode());
        order.setIdempotencyKey(idempotencyKey);
        order.setOrderedDate(LocalDate.now());
        order.setCreatedAt(LocalDateTime.now());
        order.setStatus("PENDING_CONFIRMATION");
        order.setPaymentStatus("COD".equals(request.paymentMethod()) ? "UNPAID" : "PENDING");
        order.setPaymentMethod(request.paymentMethod());
        order.setSubtotal(subtotal);
        order.setShippingFee(verifiedShippingFee);
        order.setDiscount(discount);
        order.setTotal(total);
        order.setVoucherCode(request.voucherCode());
        order.setRecipientName(request.recipientName());
        order.setPhone(request.phone());
        order.setDeliveryAddress(request.address());
        order.setDistrict(request.district());
        order.setStore(selectedStore.getName());
        order.setShippingMethod(request.shippingMethod());
        order.setNote(request.note());
        order.setItems(items);
        order.setUser(user);

        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setStatus(order.getStatus());
        history.setChangedBy("USER:" + request.userId());
        history.setReason("Khách hàng tạo đơn");
        history.setChangedAt(LocalDateTime.now());
        order.setStatusHistory(new ArrayList<>(List.of(history)));

        Order saved;
        productClient.reserve(inventory);
        try {
            saved = orderRepository.save(order);
            if (sseController != null) {
                sseController.broadcastOrderUpdate(saved);
            }
        } catch (RuntimeException exception) {
            try {
                productClient.release(inventory);
            } catch (RuntimeException releaseException) {
                exception.addSuppressed(releaseException);
            }
            throw exception;
        }
        if (voucher != null) {
            voucher.setUsedCount((voucher.getUsedCount() == null ? 0 : voucher.getUsedCount()) + 1);
            if (voucher.getBudget() != null) voucher.setBudget(voucher.getBudget().subtract(discount).max(BigDecimal.ZERO));
            voucherRepository.save(voucher);
            VoucherRedemption redemption = new VoucherRedemption();
            redemption.setVoucherId(voucher.getId()); redemption.setVoucherCode(voucher.getCode()); redemption.setUserId(request.userId());
            redemption.setOrderId(saved.getId()); redemption.setDiscountAmount(discount); redemption.setRedeemedAt(LocalDateTime.now());
            redemptionRepository.save(redemption);
        }
        
        String email = remoteUser.getUserDetails() != null ? remoteUser.getUserDetails().getEmail() : remoteUser.getUserName();
        publish("ORDER_CREATED", saved, email);
        return saved;
    }

    @Transactional
    public Order changeStatus(Long orderId, String status, String changedBy, String reason) {
        Set<String> allowed = Set.of("PENDING_CONFIRMATION", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "SHIPPING", "DELIVERING", "COMPLETED", "CANCELLED", "REJECTED");
        if (!allowed.contains(status)) throw new IllegalArgumentException("Trạng thái đơn hàng không hợp lệ");
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new NoSuchElementException("Không tìm thấy đơn hàng"));
        String previousStatus = order.getStatus();
        order.setStatus(status);
        if ("CANCELLED".equals(status) || "REJECTED".equals(status)) order.setCancellationReason(reason);
        if (("CANCELLED".equals(status) || "REJECTED".equals(status)) && !"CANCELLED".equals(previousStatus) && !"REJECTED".equals(previousStatus)) {
            productClient.release(order.getItems().stream().map(i -> new InventoryItemRequest(i.getSourceProductId(), i.getSku(), i.getQuantity(), i.getUnitPrice())).toList());
            redemptionRepository.findByOrderId(orderId).ifPresent(redemption -> {
                voucherRepository.findById(redemption.getVoucherId()).ifPresent(voucher -> {
                    voucher.setUsedCount(Math.max(0, (voucher.getUsedCount() == null ? 0 : voucher.getUsedCount()) - 1));
                    if (voucher.getBudget() != null) voucher.setBudget(voucher.getBudget().add(redemption.getDiscountAmount()));
                    voucherRepository.save(voucher);
                });
                redemptionRepository.delete(redemption);
            });
        }
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setStatus(status);
        history.setChangedBy(changedBy == null || changedBy.isBlank() ? "ADMIN" : changedBy);
        history.setReason(reason);
        history.setChangedAt(LocalDateTime.now());
        if (order.getStatusHistory() == null) order.setStatusHistory(new ArrayList<>());
        order.getStatusHistory().add(history);
        Order saved = orderRepository.save(order);
        
        String email = null;
        if (order.getUser() != null) {
            try {
                User remoteUser = userClient.getUserById(order.getUser().getId());
                email = remoteUser != null && remoteUser.getUserDetails() != null ? remoteUser.getUserDetails().getEmail() : order.getUser().getUserName();
            } catch (Exception e) {
                email = order.getUser().getUserName();
            }
        }
        
        publish("ORDER_STATUS_CHANGED", saved, email);
        if (sseController != null) {
            sseController.broadcastOrderUpdate(saved);
        }
        return saved;
    }

    @Transactional
    public Order cancelByCustomer(Long orderId, Long userId, String reason) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new NoSuchElementException("Không tìm thấy đơn hàng"));
        if (order.getUser() == null || !Objects.equals(order.getUser().getId(), userId)) throw new IllegalArgumentException("Bạn không có quyền hủy đơn này");
        if (!Set.of("PENDING_CONFIRMATION", "CONFIRMED").contains(order.getStatus())) throw new IllegalArgumentException("Đơn đã được chuẩn bị nên không thể hủy");
        return changeStatus(orderId, "CANCELLED", "USER:" + userId, reason == null || reason.isBlank() ? "Khách hàng hủy đơn" : reason);
    }

    @Transactional
    public Order assignToStaff(Long orderId, Long staffId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new NoSuchElementException("Không tìm thấy đơn hàng"));
        if (!"CONFIRMED".equals(order.getStatus()) && !"PENDING_CONFIRMATION".equals(order.getStatus())) {
            throw new IllegalArgumentException("Đơn hàng không ở trạng thái hợp lệ để nhân viên nhận");
        }
        order.setStaffId(staffId);
        return changeStatus(orderId, "PREPARING", "STAFF:" + staffId, "Nhân viên nhận đóng gói");
    }

    @Transactional
    public Order assignToShipper(Long orderId, Long shipperId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new NoSuchElementException("Không tìm thấy đơn hàng"));
        if (!"READY_FOR_PICKUP".equals(order.getStatus())) {
            throw new IllegalArgumentException("Đơn hàng chưa sẵn sàng để giao");
        }
        order.setShipperId(shipperId);
        return changeStatus(orderId, "DELIVERING", "SHIPPER:" + shipperId, "Shipper nhận đi giao");
    }

    private Item toItem(CheckoutItemRequest source) {
        Item item = new Item();
        item.setQuantity(source.quantity());
        item.setUnitPrice(source.unitPrice());
        item.setSubTotal(source.unitPrice().multiply(BigDecimal.valueOf(source.quantity())));
        item.setProductNameSnapshot(source.productName());
        item.setSize(source.size());
        item.setSku(source.sku());
        item.setSourceProductId(source.productId());
        return item;
    }

    private Voucher validateVoucher(String code, Long userId, BigDecimal subtotal) {
        if (code == null || code.isBlank()) return null;
        Voucher voucher = voucherRepository.findByCodeIgnoreCase(code.trim()).orElseThrow(() -> new IllegalArgumentException("Voucher không tồn tại"));
        LocalDateTime now = LocalDateTime.now();
        if (!voucher.isActive() || voucher.getStartsAt() != null && voucher.getStartsAt().isAfter(now) || voucher.getExpiresAt() != null && voucher.getExpiresAt().isBefore(now)) throw new IllegalArgumentException("Voucher chưa có hiệu lực hoặc đã hết hạn");
        if (voucher.getMinOrder() != null && subtotal.compareTo(voucher.getMinOrder()) < 0) throw new IllegalArgumentException("Đơn hàng chưa đạt giá trị tối thiểu của voucher");
        if (voucher.getUsageLimit() != null && (voucher.getUsedCount() == null ? 0 : voucher.getUsedCount()) >= voucher.getUsageLimit()) throw new IllegalArgumentException("Voucher đã hết lượt sử dụng");
        if (voucher.getPerUserLimit() != null && redemptionRepository.countByVoucherIdAndUserId(voucher.getId(), userId) >= voucher.getPerUserLimit()) throw new IllegalArgumentException("Bạn đã dùng hết lượt của voucher này");
        return voucher;
    }

    private BigDecimal calculateDiscount(Voucher voucher, BigDecimal subtotal, BigDecimal shippingFee) {
        if (voucher == null) return BigDecimal.ZERO;
        BigDecimal discount = switch (voucher.getType()) {
            case "PERCENT" -> subtotal.multiply(voucher.getValue()).divide(BigDecimal.valueOf(100));
            case "FREE_SHIPPING" -> shippingFee;
            default -> voucher.getValue();
        };
        if (voucher.getMaxDiscount() != null && voucher.getMaxDiscount().compareTo(BigDecimal.ZERO) > 0) discount = discount.min(voucher.getMaxDiscount());
        if (voucher.getBudget() != null && discount.compareTo(voucher.getBudget()) > 0) throw new IllegalArgumentException("Ngân sách voucher không còn đủ");
        return discount.min(subtotal.add(shippingFee));
    }

    private String generateOrderCode() {
        return "HLC-" + LocalDate.now().toString().replace("-", "") + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private void publish(String eventType, Order order, String email) {
        Map<String, Object> event = new HashMap<>();
        event.put("eventType", eventType);
        event.put("orderId", order.getId());
        event.put("orderCode", order.getOrderCode());
        event.put("userId", order.getUser() == null ? null : order.getUser().getId());
        event.put("recipientName", order.getRecipientName());
        event.put("email", email);
        event.put("total", order.getTotal());
        event.put("shippingFee", order.getShippingFee());
        event.put("discount", order.getDiscount());
        event.put("status", order.getStatus());
        
        List<Map<String, Object>> itemPayloads = new ArrayList<>();
        if (order.getItems() != null) {
            for (Item item : order.getItems()) {
                Map<String, Object> itemData = new HashMap<>();
                itemData.put("productName", item.getProductNameSnapshot());
                itemData.put("size", item.getSize());
                itemData.put("quantity", item.getQuantity());
                itemData.put("unitPrice", item.getUnitPrice());
                itemData.put("subTotal", item.getSubTotal());
                itemPayloads.add(itemData);
            }
        }
        event.put("items", itemPayloads);
        
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                userClient.sendOrderInvoiceEmail(event);
            } catch (Exception exception) {
                log.warn("Không thể gửi email hóa đơn cho đơn {}: {}", order.getOrderCode(), exception.getMessage());
            }
        });
    }

    @Transactional
    public Order reportItemIssue(Long orderId, Long itemId, String reason) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new NoSuchElementException("Không tìm thấy đơn hàng"));
        
        Item problemItem = order.getItems().stream().filter(i -> i.getId().equals(itemId)).findFirst().orElse(null);
        if (problemItem == null) throw new IllegalArgumentException("Không tìm thấy sản phẩm trong đơn");
        
        order.setProblemItemId(itemId);
        order.setProblemReason(reason);
        order.setStatus("PENDING_USER_DECISION");
        
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setStatus(order.getStatus());
        history.setChangedBy("ADMIN");
        history.setReason("Báo lỗi món: " + reason);
        history.setChangedAt(LocalDateTime.now());
        if (order.getStatusHistory() == null) order.setStatusHistory(new ArrayList<>());
        order.getStatusHistory().add(history);
        
        Order saved = orderRepository.save(order);
        
        String email = null;
        if (order.getUser() != null) {
            try {
                User remoteUser = userClient.getUserById(order.getUser().getId());
                email = remoteUser != null && remoteUser.getUserDetails() != null ? remoteUser.getUserDetails().getEmail() : order.getUser().getUserName();
            } catch (Exception e) {
                email = order.getUser().getUserName();
            }
        }
        
        publish("ITEM_ISSUE_REPORTED", saved, email);
        if (sseController != null) {
            sseController.broadcastOrderUpdate(saved);
        }
        return saved;
    }

    @Transactional
    public Order resolveItemIssue(Long orderId, Long userId, String action) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new NoSuchElementException("Không tìm thấy đơn hàng"));
        if (order.getUser() == null || !Objects.equals(order.getUser().getId(), userId)) throw new IllegalArgumentException("Bạn không có quyền xử lý đơn này");
        if (!"PENDING_USER_DECISION".equals(order.getStatus())) throw new IllegalArgumentException("Đơn không ở trạng thái chờ quyết định");
        
        if ("CANCEL".equalsIgnoreCase(action)) {
            return changeStatus(orderId, "CANCELLED", "USER:" + userId, "Khách hàng không đồng ý bỏ món, hủy toàn bộ đơn");
        } else if ("CONTINUE".equalsIgnoreCase(action)) {
            Long problemItemId = order.getProblemItemId();
            if (problemItemId != null) {
                Item itemToRemove = null;
                for (Item i : order.getItems()) {
                    if (i.getId().equals(problemItemId)) {
                        itemToRemove = i;
                        break;
                    }
                }
                if (itemToRemove != null) {
                    order.getItems().remove(itemToRemove);
                    if (itemToRemove.getOrders() != null) itemToRemove.getOrders().remove(order);
                    
                    BigDecimal newSubtotal = com.rainbowforest.orderservice.utilities.OrderUtilities.countTotalPrice(order.getItems());
                    order.setSubtotal(newSubtotal);
                    BigDecimal shipping = order.getShippingFee() != null ? order.getShippingFee() : BigDecimal.ZERO;
                    BigDecimal discount = order.getDiscount() != null ? order.getDiscount() : BigDecimal.ZERO;
                    order.setTotal(newSubtotal.add(shipping).subtract(discount));
                }
            }
            order.setProblemItemId(null);
            order.setProblemReason(null);
            order.setStatus("PENDING_CONFIRMATION");
            
            OrderStatusHistory history = new OrderStatusHistory();
            history.setOrder(order);
            history.setStatus(order.getStatus());
            history.setChangedBy("USER:" + userId);
            history.setReason("Khách hàng đồng ý bỏ món lỗi và tiếp tục mua");
            history.setChangedAt(LocalDateTime.now());
            order.getStatusHistory().add(history);
            
            Order saved = orderRepository.save(order);
            if (sseController != null) {
                sseController.broadcastOrderUpdate(saved);
            }
            return saved;
        } else {
            throw new IllegalArgumentException("Hành động không hợp lệ");
        }
    }
}

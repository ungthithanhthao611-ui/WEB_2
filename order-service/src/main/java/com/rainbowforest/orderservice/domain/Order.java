package com.rainbowforest.orderservice.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table (name = "orders")
public class Order {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_code", unique = true)
    private String orderCode;

    @Column(name = "idempotency_key", unique = true)
    private String idempotencyKey;

    @Column (name = "ordered_date")
    @NotNull
    private LocalDate orderedDate;

    @Column(name = "status")
    @NotNull
    private String status;

    @Column (name = "total")
    private BigDecimal total;

    private BigDecimal subtotal;
    private BigDecimal shippingFee;
    private BigDecimal discount;
    private String voucherCode;
    private String paymentStatus;
    private String paymentMethod;
    private String recipientName;
    private String phone;
    @Column(length = 500) private String deliveryAddress;
    private String district;
    private String store;
    private String shippingMethod;
    @Column(length = 1000) private String note;
    private String cancellationReason;
    private LocalDateTime createdAt;
    
    private Long problemItemId;
    @Column(length = 1000) private String problemReason;

    @ManyToMany (cascade = CascadeType.ALL)
    @JoinTable (name = "cart" , joinColumns = @JoinColumn(name = "order_id"), inverseJoinColumns = @JoinColumn (name = "item_id"))
    private List<Item> items;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn (name = "user_id")
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("changedAt ASC")
    private List<OrderStatusHistory> statusHistory;
    
	public Order() {
		
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

    public String getOrderCode() { return orderCode; }
    public void setOrderCode(String value) { this.orderCode = value; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String value) { this.idempotencyKey = value; }

	public LocalDate getOrderedDate() {
		return orderedDate;
	}

	public void setOrderedDate(LocalDate orderedDate) {
		this.orderedDate = orderedDate;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public BigDecimal getTotal() {
		return total;
	}

	public void setTotal(BigDecimal total) {
		this.total = total;
	}

	public List<Item> getItems() {
		return items;
	}

	public void setItems(List<Item> items) {
		this.items = items;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal value) { this.subtotal = value; }
    public BigDecimal getShippingFee() { return shippingFee; }
    public void setShippingFee(BigDecimal value) { this.shippingFee = value; }
    public BigDecimal getDiscount() { return discount; }
    public void setDiscount(BigDecimal value) { this.discount = value; }
    public String getVoucherCode() { return voucherCode; }
    public void setVoucherCode(String value) { this.voucherCode = value; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String value) { this.paymentStatus = value; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String value) { this.paymentMethod = value; }
    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String value) { this.recipientName = value; }
    public String getPhone() { return phone; }
    public void setPhone(String value) { this.phone = value; }
    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String value) { this.deliveryAddress = value; }
    public String getDistrict() { return district; }
    public void setDistrict(String value) { this.district = value; }
    public String getStore() { return store; }
    public void setStore(String value) { this.store = value; }
    public String getShippingMethod() { return shippingMethod; }
    public void setShippingMethod(String value) { this.shippingMethod = value; }
    public String getNote() { return note; }
    public void setNote(String value) { this.note = value; }
    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String value) { this.cancellationReason = value; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime value) { this.createdAt = value; }
    public List<OrderStatusHistory> getStatusHistory() { return statusHistory; }
    public void setStatusHistory(List<OrderStatusHistory> value) { this.statusHistory = value; }
    public Long getProblemItemId() { return problemItemId; }
    public void setProblemItemId(Long problemItemId) { this.problemItemId = problemItemId; }
    public String getProblemReason() { return problemReason; }
    public void setProblemReason(String problemReason) { this.problemReason = problemReason; }
}

package com.rainbowforest.productcatalogservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Entity
@Table (name = "products")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Product {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @Column (name = "product_name")
    @NotNull
    private String productName;

    @Column (name = "price")
    @NotNull
    private BigDecimal price;

    @Column (name = "original_price")
    private BigDecimal originalPrice;

    @Column (name = "discription")
    private String discription;

    @Column (name = "category")
    @NotNull
    private String category;

    @Column (name = "availability")
    @NotNull
    private int availability;

    @Column (name = "image_url")
    private String imageUrl;

	public Product() {

	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getProductName() {
		return productName;
	}

	public void setProductName(String productName) {
		this.productName = productName;
	}

	public BigDecimal getPrice() {
		return price;
	}

	public void setPrice(BigDecimal price) {
		this.price = price;
	}

	public BigDecimal getOriginalPrice() {
		return originalPrice;
	}

	public void setOriginalPrice(BigDecimal originalPrice) {
		this.originalPrice = originalPrice;
	}

	public String getDiscription() {
		return discription;
	}

	public void setDiscription(String discription) {
		this.discription = discription;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public int getAvailability() {
		return availability;
	}

	public void setAvailability(int availability) {
		this.availability = availability;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}

	@JsonProperty("name")
	public String getName() {
		return productName;
	}

	@JsonProperty("name")
	public void setName(String name) {
		this.productName = name;
	}

	@JsonProperty("description")
	public String getDescription() {
		return discription;
	}

	@JsonProperty("description")
	public void setDescription(String description) {
		this.discription = description;
	}

	@JsonProperty("quantity")
	public int getQuantity() {
		return availability;
	}

	@JsonProperty("quantity")
	public void setQuantity(int quantity) {
		this.availability = quantity;
	}

	@JsonProperty("categoryId")
	public String getCategoryId() {
		return category;
	}

	@JsonProperty("categoryId")
	public void setCategoryId(String categoryId) {
		this.category = categoryId;
	}
}

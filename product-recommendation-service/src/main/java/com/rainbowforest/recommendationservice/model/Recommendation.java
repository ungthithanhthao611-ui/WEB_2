package com.rainbowforest.recommendationservice.model;

import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table (name = "recommendation")
public class Recommendation {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column (name = "rating")
    private int rating;

    @Column (name = "comment", length = 1000)
    private String comment;

    @Column (name = "image_base64", columnDefinition = "TEXT")
    private String imageUrl;

    @Column (name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne (cascade = {CascadeType.MERGE, CascadeType.PERSIST})
    @JoinColumn (name = "product_id")
    private Product product;

    @ManyToOne (cascade = {CascadeType.MERGE, CascadeType.PERSIST})
    @JoinColumn (name = "user_id")
    private User user;
    
    public Recommendation() {
	    this.createdAt = LocalDateTime.now();
	}

	public Recommendation(int rating, String comment, String imageUrl, Product product, User user) {
        this.rating = rating;
        this.comment = comment;
        this.imageUrl = imageUrl;
        this.product = product;
        this.user = user;
        this.createdAt = LocalDateTime.now();
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

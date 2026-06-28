package com.rainbowforest.userservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;

@Entity
@Table (name = "users")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @Column (name = "user_name", nullable = false, unique = true, length = 50)
    private String userName;
    @Column (name = "user_password", nullable = false, length = 255)
    private String userPassword;
    @Column (name = "active")
    private int active;

    @Column(name = "reset_otp", length = 6)
    private String resetOtp;

    @Column(name = "reset_otp_expiry")
    private java.time.LocalDateTime resetOtpExpiry;

    @OneToOne (cascade = CascadeType.ALL)
    @JoinColumn (name = "user_details_id")
    private UserDetails userDetails;

    @ManyToOne
    @JoinColumn (name = "role_id")
    private UserRole role;

    @ElementCollection
    @CollectionTable(name = "user_wishlist", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "product_id")
    private java.util.Set<Long> wishlist = new java.util.HashSet<>();

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public String getUserPassword() {
		return userPassword;
	}

	public void setUserPassword(String userPassword) {
		this.userPassword = userPassword;
	}

	public int getActive() {
		return active;
	}

	public void setActive(int active) {
		this.active = active;
	}

	public UserDetails getUserDetails() {
		return userDetails;
	}

	public void setUserDetails(UserDetails userDetails) {
		this.userDetails = userDetails;
	}

	public UserRole getRole() {
		return role;
	}

	public void setRole(UserRole role) {
		this.role = role;
	}

	public String getResetOtp() {
		return resetOtp;
	}

	public void setResetOtp(String resetOtp) {
		this.resetOtp = resetOtp;
	}

	public java.time.LocalDateTime getResetOtpExpiry() {
		return resetOtpExpiry;
	}

	public void setResetOtpExpiry(java.time.LocalDateTime resetOtpExpiry) {
		this.resetOtpExpiry = resetOtpExpiry;
	}

    public java.util.Set<Long> getWishlist() {
        return wishlist;
    }

    public void setWishlist(java.util.Set<Long> wishlist) {
        this.wishlist = wishlist;
    }
}

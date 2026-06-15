package com.rainbowforest.productcatalogservice.entity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
@Entity @Table(name="product_variants",uniqueConstraints=@UniqueConstraint(columnNames={"product_id","size_name"}))
public class ProductVariant {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="product_id",nullable=false) @JsonIgnore private Product product;
 @Column(name="size_name",nullable=false) @NotBlank private String name;
 @Column(unique=true,nullable=false) @NotBlank private String sku;
 @Positive private BigDecimal price; private BigDecimal salePrice; @PositiveOrZero private Integer stock=0; private boolean active=true;
 public Long getId(){return id;} public void setId(Long v){id=v;} public Product getProduct(){return product;} public void setProduct(Product v){product=v;}
 public String getName(){return name;} public void setName(String v){name=v;} public String getSku(){return sku;} public void setSku(String v){sku=v;}
 public BigDecimal getPrice(){return price;} public void setPrice(BigDecimal v){price=v;} public BigDecimal getSalePrice(){return salePrice;} public void setSalePrice(BigDecimal v){salePrice=v;}
 public Integer getStock(){return stock;} public void setStock(Integer v){stock=v;} public boolean isActive(){return active;} public void setActive(boolean v){active=v;}
}

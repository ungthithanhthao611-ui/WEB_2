package com.rainbowforest.orderservice.domain;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity @Table(name="banners")
public class Banner {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 private String label; @Column(nullable=false) private String title;
 @Column(length=1000) private String description;
 @Column(length=2000,nullable=false) private String imageUrl;
 private String link; private String position; private boolean featured; private boolean active=true; private Integer sortOrder=1;
 private LocalDateTime startsAt; private LocalDateTime endsAt;
 public Long getId(){return id;} public void setId(Long v){id=v;} public String getLabel(){return label;} public void setLabel(String v){label=v;}
 public String getTitle(){return title;} public void setTitle(String v){title=v;} public String getDescription(){return description;} public void setDescription(String v){description=v;}
 public String getImageUrl(){return imageUrl;} public void setImageUrl(String v){imageUrl=v;} public String getLink(){return link;} public void setLink(String v){link=v;}
 public String getPosition(){return position;} public void setPosition(String v){position=v;} public boolean isFeatured(){return featured;} public void setFeatured(boolean v){featured=v;}
 public boolean isActive(){return active;} public void setActive(boolean v){active=v;} public Integer getSortOrder(){return sortOrder;} public void setSortOrder(Integer v){sortOrder=v;}
 public LocalDateTime getStartsAt(){return startsAt;} public void setStartsAt(LocalDateTime v){startsAt=v;} public LocalDateTime getEndsAt(){return endsAt;} public void setEndsAt(LocalDateTime v){endsAt=v;}
}

package com.rainbowforest.orderservice.domain;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity @Table(name="support_tickets")
public class SupportTicket {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(unique=true) private String ticketCode; private Long userId; private Long orderId;
 private String name; private String email; private String topic; private String priority="NORMAL"; private String status="NEW"; private String assignedTo;
 @Column(length=3000) private String message; @Column(length=3000) private String adminResponse; private String resolution;
 private LocalDateTime createdAt; private LocalDateTime dueAt; private LocalDateTime updatedAt; private Integer rating;
 public Long getId(){return id;} public void setId(Long v){id=v;} public String getTicketCode(){return ticketCode;} public void setTicketCode(String v){ticketCode=v;}
 public Long getUserId(){return userId;} public void setUserId(Long v){userId=v;} public Long getOrderId(){return orderId;} public void setOrderId(Long v){orderId=v;}
 public String getName(){return name;} public void setName(String v){name=v;} public String getEmail(){return email;} public void setEmail(String v){email=v;}
 public String getTopic(){return topic;} public void setTopic(String v){topic=v;} public String getPriority(){return priority;} public void setPriority(String v){priority=v;}
 public String getStatus(){return status;} public void setStatus(String v){status=v;} public String getAssignedTo(){return assignedTo;} public void setAssignedTo(String v){assignedTo=v;}
 public String getMessage(){return message;} public void setMessage(String v){message=v;} public String getAdminResponse(){return adminResponse;} public void setAdminResponse(String v){adminResponse=v;}
 public String getResolution(){return resolution;} public void setResolution(String v){resolution=v;} public LocalDateTime getCreatedAt(){return createdAt;} public void setCreatedAt(LocalDateTime v){createdAt=v;}
 public LocalDateTime getDueAt(){return dueAt;} public void setDueAt(LocalDateTime v){dueAt=v;} public LocalDateTime getUpdatedAt(){return updatedAt;} public void setUpdatedAt(LocalDateTime v){updatedAt=v;}
 public Integer getRating(){return rating;} public void setRating(Integer v){rating=v;}
}

package com.rainbowforest.orderservice.repository;
import com.rainbowforest.orderservice.domain.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface SupportTicketRepository extends JpaRepository<SupportTicket,Long>{List<SupportTicket> findByUserIdOrderByCreatedAtDesc(Long userId);}

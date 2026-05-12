package com.lms.backend.entity;

import com.lms.backend.enums.FineStatus;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "fines")
@Data
public class Fine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private BigDecimal amount;
    private String reason;

    private Long readerId;

    @Enumerated(EnumType.STRING)
    private FineStatus status;

    @ManyToOne
    @JoinColumn(name = "loan_detail_id")
    private LoanDetail loanDetail;

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "payment_id")
    private Payment payment;
}
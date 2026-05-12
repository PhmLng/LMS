package com.lms.backend.entity;

import com.lms.backend.enums.RenewalStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "renewals")
@Data
public class Renewal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "request_date")
    private LocalDate requestDate;

    @Column(name = "old_due_date")
    private LocalDate oldDueDate;

    @Column(name = "new_date", nullable = false)
    private LocalDate newDate;

    @Enumerated(EnumType.STRING)
    private RenewalStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loan_detail_id")
    private LoanDetail loanDetail;
}

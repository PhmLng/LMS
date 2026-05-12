package com.lms.backend.entity;

import com.lms.backend.enums.LoanDetailStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "loan_details")
@Data
public class LoanDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne
    @JoinColumn(name = "loan_slip_id")
    private LoanSlip loanSlip;

    private LocalDate returnDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    private LoanDetailStatus status;

    @ManyToOne
    @JoinColumn(name = "book_copy_id")
    private BookCopy bookCopy;
}
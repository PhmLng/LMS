package com.lms.backend.entity;

import com.lms.backend.enums.LoanStatus;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.BatchSize;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "loan_slips")
@Data
public class LoanSlip {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "borrow_date")
    private LocalDateTime borrowDate;

    @Enumerated(EnumType.STRING)
    private LoanStatus status;

    @ManyToOne
    @JoinColumn(name = "card_id")
    private LibraryCard libraryCard;

    @OneToMany(mappedBy = "loanSlip", cascade = CascadeType.ALL)
    @BatchSize(size = 20)
    private List<LoanDetail> details;
}
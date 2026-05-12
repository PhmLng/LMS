package com.lms.backend.entity;

import com.lms.backend.enums.CardStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "library_cards")
@Getter
@Setter
public class LibraryCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "card_code", unique = true, nullable = false)
    private String cardCode;

    @Column(name = "issue_date")
    private LocalDateTime issueDate;

    @Column(name = "expiry_date", nullable = false)
    private LocalDateTime expiryDate;

    @Enumerated(EnumType.STRING)
    private CardStatus status;

    @OneToOne
    @JoinColumn(name = "reader_id", unique = true)
    private Reader reader;

}
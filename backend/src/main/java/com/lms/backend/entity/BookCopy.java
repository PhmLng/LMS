package com.lms.backend.entity;

import com.lms.backend.enums.BookCopyStatus;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "book_copies")
@Data
public class BookCopy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String barcode;

    private String location;

    @Enumerated(EnumType.STRING)
    private BookCopyStatus status;

    @Column(name = "is_deleted")
    private boolean isDeleted = false;

    @ManyToOne
    @JoinColumn(name = "book_id")
    private Book book;
}
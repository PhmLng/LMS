package com.lms.backend.entity;

import com.lms.backend.enums.BookStatus;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@Table(name = "books")
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String isbn;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "publish_year")
    private int publishYear;

    @Column(name = "price")
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    private BookStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private Author author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "publisher_id")
    private Publisher publisher;

    @Column(name = "is_deleted")
    private Boolean isDeleted=false;

    @CreationTimestamp
    private LocalDateTime createdAt;
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "categories_books",
            joinColumns = @JoinColumn(name = "book_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private List<Category> categories;
}

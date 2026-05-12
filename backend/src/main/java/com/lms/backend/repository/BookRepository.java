package com.lms.backend.repository;

import com.lms.backend.entity.Book;
import com.lms.backend.enums.BookStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    @EntityGraph(attributePaths = {"author", "publisher", "categories"})
    Page<Book> findAllByIsDeletedFalse(Pageable pageable);

    @EntityGraph(attributePaths = {"author", "publisher", "categories"})
    @Query("SELECT DISTINCT b FROM Book b " +
            "LEFT JOIN b.categories c " +
            "WHERE (:title IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :title, '%'))) " +
            "AND (:authorId IS NULL OR b.author.id = :authorId) " +
            "AND (:publisherId IS NULL OR b.publisher.id = :publisherId) " +
            "AND (:status IS NULL OR b.status = :status)"+
            "AND (:categoryId IS NULL OR c.id = :categoryId)"+
            "AND b.isDeleted = false"
    )
    Page<Book> filterBooks(
           @Param("title") String title,
           @Param("categoryId") Long categoryId,
           @Param("publisherId") Long publisherId,
           @Param("status") BookStatus status,
           @Param("authorId") Long authorId,
           Pageable pageable
    );
    @Override
    @EntityGraph(attributePaths = {"author", "publisher", "categories"})
    Optional<Book> findById(Long id);

    @Override
    @EntityGraph(attributePaths = {"author", "publisher", "categories"})
    List<Book> findAllById(Iterable<Long> ids);

}

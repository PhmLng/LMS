package com.lms.backend.repository;

import com.lms.backend.entity.BookCopy;
import com.lms.backend.enums.BookCopyStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BookCopyRepository extends JpaRepository<BookCopy, Long> {

    @EntityGraph(attributePaths = {"book"})
    Page<BookCopy> findAllByIsDeletedFalse(Pageable pageable);

    @EntityGraph(attributePaths = {"book"})
    Optional<BookCopy> findByBarcodeAndIsDeletedFalse(String barcode);

    @EntityGraph(attributePaths = {"book"})
    @Query("SELECT bc FROM BookCopy bc WHERE "+
            ":bookId IS NULL OR bc.book.id = :bookId AND "+
            ":status IS NULL OR bc.status = :status AND "+
            "bc.isDeleted=false "
    )
    Page<BookCopy> searchBookCopy(@Param("status") BookCopyStatus status,@Param("bookId") Long bookId, Pageable pageable);
    Long countByBookId(Long bookId);
    Boolean existsByBarcode(String barcode);
}

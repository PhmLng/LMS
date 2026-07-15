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
    @Query("SELECT bc FROM BookCopy bc WHERE " +
            "(:bookId IS NULL OR bc.book.id = :bookId) AND " +  // Ép xử lý lọc Book trước
            "(:status IS NULL OR bc.status = :status) AND " +    // Ép xử lý lọc Status sau
            "bc.isDeleted = false"                               // Bốt chốt chặn cuối cùng!
    )
    Page<BookCopy> searchBookCopy(@Param("status") BookCopyStatus status,@Param("bookId") Long bookId, Pageable pageable);

    Long countByBookId(Long bookId);
    Boolean existsByBarcode(String barcode);
    Long countByStatus(BookCopyStatus status);
    int countByBookIdAndIsDeleted(Long bookId, boolean isDeleted);
    @Query("SELECT COUNT (bc) FROM BookCopy bc WHERE "+
            "bc.book.id = :bookId AND (bc.status = 'BORROWED' OR bc.status ='LOST') AND "+
            "bc.isDeleted=false"
    )
    int countRemainingQuantity(Long bookId);
}

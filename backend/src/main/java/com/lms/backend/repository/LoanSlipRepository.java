package com.lms.backend.repository;

import com.lms.backend.entity.Book;
import com.lms.backend.entity.LibraryCard;
import com.lms.backend.entity.LoanSlip;
import com.lms.backend.enums.LoanStatus;
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
public interface LoanSlipRepository extends JpaRepository<LoanSlip, Long> {
    @Query("SELECT COUNT(l) > 0 FROM LoanSlip l " +
            "WHERE l.libraryCard.cardCode = :cardCode " +
            "AND l.status = :status")
    boolean existsByStatus(@Param("cardCode") String cardCode, @Param("status") LoanStatus status);

    @EntityGraph(attributePaths = {"libraryCard", "libraryCard.reader"})
    Page<LoanSlip> findAllByStatus(LoanStatus status, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"libraryCard","details","details.bookCopy.book"})
    Page<LoanSlip> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"libraryCard","details","details.bookCopy"})
    @Query("SELECT l FROM LoanSlip l WHERE l.id = :id")
    Optional<LoanSlip> findById(@Param("id") Long id);

    @EntityGraph(attributePaths = {
            "libraryCard",
            "libraryCard.reader",
            "details",
            "details.bookCopy",
            "details.bookCopy.book"
    })
    @Query("SELECT ls FROM LoanSlip ls WHERE " +
            "(:cardId IS NULL OR ls.libraryCard.id = :cardId) AND " +
            "(:status IS NULL OR ls.status = :status)")
    Page<LoanSlip> searchLoanSlips(Long cardId, LoanStatus status, Pageable pageable);
}

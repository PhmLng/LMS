package com.lms.backend.repository;

import com.lms.backend.entity.LoanDetail;
import com.lms.backend.entity.LoanSlip;
import com.lms.backend.enums.LoanDetailStatus;
import com.lms.backend.enums.LoanStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LoanDetailRepository extends JpaRepository<LoanDetail,Long> {
    @Query("SELECT COUNT (ld) FROM LoanDetail ld WHERE "+
            "ld.loanSlip.libraryCard.cardCode = :libraryCardId "+
            "AND ld.status = 'BORROWING'"
    )
    int countCurrentlyBorrowed(String libraryCardId);

    int countByLoanSlipAndStatus(LoanSlip loanSlip, LoanDetailStatus status);

    @Override
    @EntityGraph(attributePaths = {"loanSlip","bookCopy"})
    Optional<LoanDetail> findById(Long id);

    @EntityGraph(attributePaths = {"bookCopy","bookCopy.book","loanSlip.libraryCard.reader"})
    @Query("SELECT ld FROM LoanDetail ld WHERE ld.bookCopy.barcode = :barcode AND ld.status = 'BORROWING'")
    Optional<LoanDetail> findActiveByBarcode(String barcode);

    @EntityGraph(attributePaths = {
            "bookCopy.book",
            "loanSlip",
            "loanSlip.libraryCard",
            "loanSlip.libraryCard.reader"
    })
    @Query("SELECT ld FROM LoanDetail ld WHERE ld.loanSlip.libraryCard.cardCode = :cardCode AND ld.status = 'BORROWING'")
    List<LoanDetail> findAllActiveByCardCode(String cardCode);

    @EntityGraph(attributePaths = {"bookCopy"})
    @Query("SELECT ld FROM LoanDetail ld " +
            "JOIN FETCH ld.bookCopy bc " +
            "JOIN FETCH bc.book b " +
            "JOIN ld.loanSlip ls " +
            "JOIN ls.libraryCard lc " +
            "WHERE lc.reader.id = :readerId AND ld.status = 'BORROWING'")
    List<LoanDetail> findActiveLoansByReaderId(@Param("readerId") Long readerId);
}

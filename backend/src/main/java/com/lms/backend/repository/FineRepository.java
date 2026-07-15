package com.lms.backend.repository;

import com.lms.backend.dto.fineDto.FineResponse;
import com.lms.backend.entity.Fine;
import com.lms.backend.enums.FineStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface FineRepository extends JpaRepository<Fine, Long> {
    @EntityGraph(attributePaths = {"loanDetail","loanDetail.bookCopy"})
    @Query("SELECT f FROM Fine f WHERE " +
            "(:readerId IS NULL OR f.readerId = :readerId) AND " +
            "(:status IS NULL OR f.status = :status)")
    Page<Fine> getAllFineByCondition(Long readerId, FineStatus status,Pageable pageable);
}

package com.lms.backend.repository;

import com.lms.backend.entity.Renewal;
import com.lms.backend.enums.RenewalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;

public interface RenewalRepository extends JpaRepository<Renewal, Long> {
    int countByLoanDetailIdAndStatus(Long loanDetailId, RenewalStatus renewalStatus);
    Optional<Renewal> findFirstByLoanDetailIdOrderByIdDesc(Long loanDetailId);
    Boolean existsByLoanDetailIdAndStatus(Long id, RenewalStatus renewalStatus);

    @Query("SELECT r FROM Renewal r WHERE "+
            ":renewalStatus IS NULL OR r.status = :renewalStatus"
    )
    Optional<Page<Renewal>> filterByStatus(RenewalStatus renewalStatus, Pageable pageable);
}

package com.lms.backend.repository;


import com.lms.backend.entity.Staff;
import com.lms.backend.enums.AccountStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface StaffRepository extends JpaRepository<Staff, Long> {
    @Query("SELECT s FROM Staff s WHERE " +
            "(:status IS NULL OR s.account.status = :status) AND " +
            "(:roleName IS NULL OR EXISTS (SELECT r FROM s.account.roles r WHERE r.name = :roleName))"
    )
    Page<Staff> findAllStaffByCondition(Pageable pageable,AccountStatus status, String roleName);
    @Query("SELECT s FROM Staff s WHERE  LOWER(s.fullName) LIKE LOWER(CONCAT('%', :fullName, '%')) ")
    Staff findStaffByFullName(String fullName);
}

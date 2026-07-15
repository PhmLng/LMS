package com.lms.backend.repository;

import com.lms.backend.entity.Author;
import com.lms.backend.entity.Reader;
import com.lms.backend.enums.CardStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ReaderRepository extends JpaRepository<Reader, Long> {
    @Query("SELECT r FROM Reader r WHERE " +
            "(:fullName IS NULL OR LOWER(r.fullName) LIKE LOWER(CONCAT('%', :fullName, '%'))) AND "+
            "(:status IS NULL OR r.libraryCard.status = :status) "
    )
    Page<Reader> findAllReader(Pageable pageable, CardStatus status, String fullName);
}

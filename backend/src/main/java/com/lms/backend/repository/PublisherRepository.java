package com.lms.backend.repository;

import com.lms.backend.dto.publisherDto.PublisherResponse;
import com.lms.backend.entity.Publisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PublisherRepository extends JpaRepository<Publisher, Long> {

    @Query("SELECT p FROM Publisher p WHERE " +
            "(:name IS NULL OR p.name = :name) "
    )
    Page<Publisher> getAllPublishers(Pageable pageable, String name);
}

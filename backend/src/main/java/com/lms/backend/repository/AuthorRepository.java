package com.lms.backend.repository;

import com.lms.backend.dto.authorDto.AuthorResponse;
import com.lms.backend.entity.Author;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AuthorRepository extends JpaRepository<Author, Long> {

    @Query("SELECT a FROM Author a WHERE " +
            "(:name IS NULL OR a.name = :name) "
    )
    Page<Author> findAllAuthors(Pageable pageable, String name);
    Author findByName(String name);
}

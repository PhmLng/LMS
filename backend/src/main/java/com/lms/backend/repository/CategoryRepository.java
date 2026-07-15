package com.lms.backend.repository;

import com.lms.backend.entity.Category;
import com.lms.backend.entity.Publisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    @Query("SELECT c FROM Category c WHERE " +
            "(:name IS NULL OR c.name = :name) "
    )
    Page<Category> getAllCategory(Pageable pageable, String name);
}

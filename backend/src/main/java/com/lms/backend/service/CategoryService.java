package com.lms.backend.service;

import com.lms.backend.dto.categoryDto.CategoryRequest;
import com.lms.backend.dto.categoryDto.CategoryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CategoryService {
    public Page<CategoryResponse> getAllCategories(Pageable pageable,String name);
    public CategoryResponse getCategoryById(Long id);
    public CategoryResponse createCategory(CategoryRequest categoryRequest);
    public CategoryResponse updateCategory(Long id,CategoryRequest categoryRequest);
}

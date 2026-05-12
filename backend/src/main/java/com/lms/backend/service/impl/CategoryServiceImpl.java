package com.lms.backend.service.impl;

import com.lms.backend.dto.categoryDto.CategoryRequest;
import com.lms.backend.dto.categoryDto.CategoryResponse;
import com.lms.backend.entity.Category;
import com.lms.backend.mapper.CategoryMapper;
import com.lms.backend.repository.CategoryRepository;
import com.lms.backend.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    public Page<CategoryResponse> getAllCategories(Pageable pageable) {
        Page<Category> categoryPage = categoryRepository.findAll(pageable);
        Page<CategoryResponse> categoryResponses = categoryPage.map(category -> categoryMapper.toCategoryResponse(category));
        return categoryResponses;
    }

    @Override
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id).orElseThrow(()-> new RuntimeException("Category not found"));
        return categoryMapper.toCategoryResponse(category);
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest categoryRequest) {
        Category category = categoryMapper.toCategory(categoryRequest);
        categoryRepository.save(category);
        return categoryMapper.toCategoryResponse(categoryRepository.save(category));
    }

    @Override
    public CategoryResponse updateCategory(Long id,CategoryRequest categoryRequest) {
        Category category = categoryRepository.findById(id).orElseThrow(()-> new RuntimeException("Category not found"));
        categoryMapper.updateCategory(category,categoryRequest);
        categoryRepository.save(category);
        return categoryMapper.toCategoryResponse(category);
    }
}

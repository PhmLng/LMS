package com.lms.backend.controller;

import com.lms.backend.common.response.ApiResponse;
import com.lms.backend.dto.categoryDto.CategoryRequest;
import com.lms.backend.dto.categoryDto.CategoryResponse;
import com.lms.backend.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/categories")
public class CategoryController {
    private final CategoryService categoryService;

    @GetMapping("")
    public ResponseEntity<ApiResponse<Page<CategoryResponse>>> findAllCategories(@PageableDefault(page = 0, size = 10) Pageable pageable) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(categoryService.getAllCategories(pageable)));
    }
    @GetMapping("{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(categoryService.getCategoryById(id)));
    }
    @PostMapping("")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@RequestBody CategoryRequest categoryRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(categoryService.createCategory(categoryRequest)));
    }
    @PutMapping("{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(@PathVariable Long id,@RequestBody CategoryRequest categoryRequest) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(categoryService.updateCategory(id,categoryRequest)));
    }
}

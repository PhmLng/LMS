package com.lms.backend.mapper;

import com.lms.backend.dto.categoryDto.CategoryRequest;
import com.lms.backend.dto.categoryDto.CategoryResponse;
import com.lms.backend.entity.Category;
import lombok.Data;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    CategoryResponse toCategoryResponse(Category category);
    Category toCategory(CategoryRequest categoryRequest);
    void updateCategory(@MappingTarget Category category, CategoryRequest categoryRequest);
}

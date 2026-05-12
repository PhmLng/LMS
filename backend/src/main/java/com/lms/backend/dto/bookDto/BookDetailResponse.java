package com.lms.backend.dto.bookDto;

import com.lms.backend.dto.authorDto.AuthorResponse;
import com.lms.backend.dto.categoryDto.CategoryResponse;
import com.lms.backend.dto.publisherDto.PublisherResponse;
import com.lms.backend.enums.BookStatus;
import lombok.Data;

import java.util.List;

@Data
public class BookDetailResponse {
    private String title;
    private String isbn;
    private String imageUrl;
    private int publishYear;
    private BookStatus status;
    private AuthorResponse author;
    private PublisherResponse publisher;
    private List<CategoryResponse> categories;
}

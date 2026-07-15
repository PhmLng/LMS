package com.lms.backend.dto.bookDto;

import com.lms.backend.dto.authorDto.AuthorResponse;
import com.lms.backend.dto.categoryDto.CategoryResponse;
import com.lms.backend.dto.publisherDto.PublisherResponse;
import com.lms.backend.entity.Author;
import com.lms.backend.entity.Category;
import com.lms.backend.entity.Publisher;
import com.lms.backend.enums.BookStatus;
import lombok.Data;

import java.util.List;

@Data
public class BookResponse {
    private long id;
    private String title;
    private String isbn;
    private String imageUrl;
    private BookStatus status;
    private int quantity;
    private int remainingQuantity;
    private String author;
    private String publisher;
}

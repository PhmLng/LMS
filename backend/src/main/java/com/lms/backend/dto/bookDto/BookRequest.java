package com.lms.backend.dto.bookDto;

import com.lms.backend.entity.Author;
import com.lms.backend.entity.Category;
import com.lms.backend.entity.Publisher;
import com.lms.backend.enums.BookStatus;
import lombok.Data;

import java.util.List;

@Data
public class BookRequest {
    private String title;
    private String isbn;
    private String imageUrl;
    private int publishYear;
    private BookStatus status;
    private Long authorId;
    private Long publisherId;
    private List<Long> categoryIds;
}

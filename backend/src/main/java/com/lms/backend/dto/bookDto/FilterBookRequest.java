package com.lms.backend.dto.bookDto;

import com.lms.backend.enums.BookStatus;
import lombok.Data;

@Data
public class FilterBookRequest {
    String title;
    Long categoryId;
    Long authorId;
    Long publishId;
    BookStatus status;
}

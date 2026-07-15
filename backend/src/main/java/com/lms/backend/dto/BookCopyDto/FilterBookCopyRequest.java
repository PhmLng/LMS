package com.lms.backend.dto.BookCopyDto;

import com.lms.backend.controller.BookCopyController;
import com.lms.backend.enums.BookCopyStatus;
import lombok.Data;

@Data
public class FilterBookCopyRequest {
    private Long bookId;
    private BookCopyStatus status;
}

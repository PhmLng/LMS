package com.lms.backend.dto.BookCopyDto;

import com.lms.backend.dto.bookDto.BookSummaryResponse;
import com.lms.backend.dto.locationDto.LocationResponse;
import com.lms.backend.entity.Book;
import com.lms.backend.enums.BookCopyStatus;
import lombok.Data;

@Data
public class BookCopyResponse {
    private Long id;
    private Long bookId;
    private String title;
    private String barcode;
    private LocationResponse location;
    private BookCopyStatus status;
}

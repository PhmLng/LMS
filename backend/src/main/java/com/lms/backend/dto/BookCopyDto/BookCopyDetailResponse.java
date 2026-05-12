package com.lms.backend.dto.BookCopyDto;

import com.lms.backend.dto.bookDto.BookSummaryResponse;
import com.lms.backend.dto.locationDto.LocationResponse;
import com.lms.backend.enums.BookCopyStatus;
import lombok.Data;

@Data
public class BookCopyDetailResponse {
    private Long id;
    private String barcode;
    private LocationResponse location;
    private BookCopyStatus status;
    private BookSummaryResponse bookSummary;
}

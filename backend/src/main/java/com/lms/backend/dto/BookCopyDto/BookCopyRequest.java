package com.lms.backend.dto.BookCopyDto;

import com.lms.backend.dto.locationDto.LocationRequest;
import com.lms.backend.entity.Book;
import com.lms.backend.enums.BookCopyStatus;

import lombok.Data;

@Data
public class BookCopyRequest {
    private String barcode;
    private LocationRequest location;
    private BookCopyStatus status;
    private Long bookId;
}

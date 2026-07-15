package com.lms.backend.dto.readerDto;

import com.lms.backend.dto.libraryCard.LibraryCardUpdateRequest;
import lombok.Data;

@Data
public class ReaderUpdateRequest {
    private ReaderRequest readerRequest;
    private LibraryCardUpdateRequest libraryCardUpdateRequest;
}

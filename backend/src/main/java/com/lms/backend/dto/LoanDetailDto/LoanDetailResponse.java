package com.lms.backend.dto.LoanDetailDto;

import com.lms.backend.dto.bookDto.BookMinimalResponse;
import com.lms.backend.dto.bookDto.BookSummaryResponse;
import com.lms.backend.enums.LoanDetailStatus;
import lombok.Data;

import java.time.LocalDate;

@Data
public class LoanDetailResponse {
    private Long id;
    private String barcode;
    private BookMinimalResponse bookMinimalResponse;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private LoanDetailStatus status;
}

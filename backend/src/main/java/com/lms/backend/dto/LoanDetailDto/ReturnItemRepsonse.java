package com.lms.backend.dto.LoanDetailDto;

import com.lms.backend.entity.LoanDetail;
import com.lms.backend.enums.LoanDetailStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ReturnItemRepsonse {

    private Long Id;
    private String barcode;
    private String bookTitle;
    private String readerName;
    private String cardCode;
    private LocalDateTime borrowDate;
    private LocalDate dueDate;
    private Long daysOverdue;
    private BigDecimal estimatedFine;
    private LoanDetailStatus status;
}

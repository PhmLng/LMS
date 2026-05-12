package com.lms.backend.dto.loanSlipDto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Data
public class BorrowRequest {
    private Long cardId;
    private Set<String> barcodes;
    private LocalDate dueDate;
}

package com.lms.backend.dto.renewalDto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class RenewalRequest {
    private Long loanDetailId;
    private LocalDate requestedDueDate;
}

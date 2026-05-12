package com.lms.backend.dto.LoanDetailDto;

import com.lms.backend.dto.bookDto.BookMinimalResponse;
import com.lms.backend.enums.RenewalStatus;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ActiveLoanResponse {
    private Long loanDetailId;
    private String barcode;
    private BookMinimalResponse bookMinimalResponse;
    private LocalDate dueDate;
    private int renewalCount;
    private int maxRenewals;
    private RenewalStatus requestStatus;
    private boolean canRequestRenew;
}

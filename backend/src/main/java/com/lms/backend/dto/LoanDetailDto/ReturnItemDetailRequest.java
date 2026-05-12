package com.lms.backend.dto.LoanDetailDto;

import com.lms.backend.enums.LoanDetailStatus;
import lombok.Data;

@Data
public class ReturnItemDetailRequest {
    private Long loanDetailId;
    LoanDetailStatus status;
}

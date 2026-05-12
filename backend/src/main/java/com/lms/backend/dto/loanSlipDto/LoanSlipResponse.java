package com.lms.backend.dto.loanSlipDto;

import com.lms.backend.dto.LoanDetailDto.LoanDetailResponse;
import com.lms.backend.entity.LibraryCard;
import com.lms.backend.entity.LoanDetail;
import com.lms.backend.enums.LoanStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class LoanSlipResponse {
    private Long id;
    private LocalDateTime borrowDate;
    private LoanStatus status;
    private Long libraryCardId;
    private String readerName;
    private String libraryCardCode;
    private List<LoanDetailResponse> loanDetailResponses;
}

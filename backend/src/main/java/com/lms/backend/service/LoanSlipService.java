package com.lms.backend.service;

import com.lms.backend.dto.loanSlipDto.BorrowRequest;
import com.lms.backend.dto.loanSlipDto.LoanSlipResponse;
import com.lms.backend.entity.LoanSlip;
import com.lms.backend.enums.LoanStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface LoanSlipService {
    public Page<LoanSlipResponse> getLoanSlips(String cardId,LoanStatus Status, Pageable pageable);
    public LoanSlipResponse getLoanSlipById(Long id);
    public LoanSlipResponse createLoanSlip(BorrowRequest borrowRequest);
    public LoanSlipResponse updateLoanSlip(LoanSlip loanSlip);
    public void syncStatus(long id);
}

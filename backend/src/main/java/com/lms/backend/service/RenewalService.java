package com.lms.backend.service;

import com.lms.backend.dto.LoanDetailDto.ActiveLoanResponse;
import com.lms.backend.dto.renewalDto.ProcessRenewalRequest;
import com.lms.backend.dto.renewalDto.RenewalRequest;
import com.lms.backend.dto.renewalDto.RenewalResponse;
import com.lms.backend.enums.RenewalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RenewalService {
    public List<ActiveLoanResponse> getActiveLoans(Long readerId);
    public void createRenewalRequest(Long id,RenewalRequest renewalRequest);
    public void processRenewal(ProcessRenewalRequest processRenewalRequest);
    public Page<RenewalResponse> getRenewals(RenewalStatus renewalStatus, Pageable pageable);
}

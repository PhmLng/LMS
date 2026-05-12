package com.lms.backend.service.impl;

import com.lms.backend.dto.LoanDetailDto.ActiveLoanResponse;
import com.lms.backend.dto.renewalDto.ProcessRenewalRequest;
import com.lms.backend.dto.renewalDto.RenewalRequest;
import com.lms.backend.dto.renewalDto.RenewalResponse;
import com.lms.backend.entity.LoanDetail;
import com.lms.backend.entity.Renewal;
import com.lms.backend.enums.RenewalStatus;
import com.lms.backend.enums.SettingKey;
import com.lms.backend.mapper.BookMapper;
import com.lms.backend.mapper.RenewalMapper;
import com.lms.backend.repository.LoanDetailRepository;
import com.lms.backend.repository.RenewalRepository;
import com.lms.backend.service.RenewalService;
import com.lms.backend.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RenewalServiceImpl implements RenewalService {
    private final LoanDetailRepository loanDetailRepository;
    private final SystemSettingService systemSettingService;
    private final RenewalRepository renewalRepository;
    private final BookMapper bookMapper;
    private final RenewalMapper renewalMapper;
    @Override
    public List<ActiveLoanResponse> getActiveLoans(Long readerId) {
        List<LoanDetail> loanDetails = loanDetailRepository.findActiveLoansByReaderId(readerId);
        List<ActiveLoanResponse> activeLoanResponses = new ArrayList<>();
        int maxRenewTimes =Integer.parseInt(systemSettingService.getSettingValueDefault(SettingKey.MAX_RENEW_TIMES));
        for (LoanDetail loanDetail : loanDetails) {
            ActiveLoanResponse activeLoanResponse = new ActiveLoanResponse();
            activeLoanResponse.setLoanDetailId(loanDetail.getId());
            activeLoanResponse.setBarcode(loanDetail.getBookCopy().getBarcode());
            activeLoanResponse.setDueDate(loanDetail.getDueDate());
            activeLoanResponse.setMaxRenewals(maxRenewTimes);
            activeLoanResponse.setBookMinimalResponse(bookMapper.toBookMinimalResponse(loanDetail.getBookCopy().getBook()));

            Optional<Renewal> lastRenewal = renewalRepository.findFirstByLoanDetailIdOrderByIdDesc(loanDetail.getId());
            if (lastRenewal.isPresent()) {
                activeLoanResponse.setRequestStatus(lastRenewal.get().getStatus());
            }else {
                activeLoanResponse.setRequestStatus(RenewalStatus.NONE);
            }

            int approvedCount = renewalRepository.countByLoanDetailIdAndStatus(loanDetail.getId(), RenewalStatus.APPROVED);
            if (approvedCount >= maxRenewTimes) {
                activeLoanResponse.setCanRequestRenew(false);
            }else {
                activeLoanResponse.setCanRequestRenew(true);
            }
            activeLoanResponses.add(activeLoanResponse);
        }
        return activeLoanResponses;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createRenewalRequest(Long id, RenewalRequest renewalRequest) {
        LoanDetail loanDetail = loanDetailRepository.findById(renewalRequest.getLoanDetailId()).orElseThrow(()->new RuntimeException("loanDetail not found"));
        if (!loanDetail.getLoanSlip().getLibraryCard().getReader().getId().equals(id)) {
            throw new RuntimeException("loanDetail does not belong to library card");
        }
        if (renewalRepository.existsByLoanDetailIdAndStatus(renewalRequest.getLoanDetailId(), RenewalStatus.PENDING)) {
            throw new RuntimeException("You are already pending renewal");
        }
        int approvedCount = renewalRepository.countByLoanDetailIdAndStatus(renewalRequest.getLoanDetailId(), RenewalStatus.APPROVED);
        if (approvedCount >= Integer.parseInt(systemSettingService.getSettingValueDefault(SettingKey.MAX_RENEW_TIMES))){
            throw new RuntimeException("You can not make a renewal for this book");
        }
        int maxMoth = Integer.parseInt(systemSettingService.getSettingValueDefault(SettingKey.MAX_RENEW_DURATION_MONTHS));
        if (renewalRequest.getRequestedDueDate().isBefore(loanDetail.getDueDate()) ||
                renewalRequest.getRequestedDueDate().isAfter(loanDetail.getDueDate().plusMonths(maxMoth))) {
            throw new RuntimeException("Ngày gia hạn không hợp lệ (Tối thiểu sau hạn cũ, tối đa 2 tháng)");
        }
        Renewal renewal = new Renewal();
        renewal.setLoanDetail(loanDetail);
        renewal.setOldDueDate(loanDetail.getDueDate());
        renewal.setNewDate(renewalRequest.getRequestedDueDate());
        renewal.setRequestDate(LocalDate.now());
        renewal.setStatus(RenewalStatus.PENDING);
        renewalRepository.save(renewal);
    }


    @Override
    @Transactional(rollbackFor = Exception.class)
    public void processRenewal(ProcessRenewalRequest processRenewalRequest) {
        Renewal renewal = renewalRepository.findById(processRenewalRequest.getRenewalId()).orElseThrow(()->new RuntimeException("renewal not found"));
        if (renewal.getStatus() != RenewalStatus.PENDING) {
            throw new RuntimeException("renewal status is not PENDING");
        }
        if (processRenewalRequest.getAction() == RenewalStatus.APPROVED) {
            renewal.setStatus(RenewalStatus.APPROVED);
            LoanDetail loanDetail = renewal.getLoanDetail();
            loanDetail.setDueDate(renewal.getNewDate());
            loanDetailRepository.save(loanDetail);
        }else if (processRenewalRequest.getAction() == RenewalStatus.REJECTED) {
            renewal.setStatus(RenewalStatus.REJECTED);
        }
        renewalRepository.save(renewal);
    }

    @Override
    public Page<RenewalResponse> getRenewals(RenewalStatus renewalStatus, Pageable pageable) {
        Page<Renewal> renewals = renewalRepository.filterByStatus(renewalStatus,pageable).orElseThrow(()->new RuntimeException("renewals not found"));
        Page<RenewalResponse> renewalResponses = renewals.map(renewal -> renewalMapper.toRenewalResponse(renewal) );
        return renewalResponses;
    }
}

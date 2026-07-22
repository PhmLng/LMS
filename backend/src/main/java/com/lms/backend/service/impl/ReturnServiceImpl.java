package com.lms.backend.service.impl;

import com.lms.backend.dto.LoanDetailDto.ReturnItemDetailRequest;
import com.lms.backend.dto.LoanDetailDto.ReturnItemRepsonse;
import com.lms.backend.dto.LoanDetailDto.ReturnRequest;
import com.lms.backend.entity.*;
import com.lms.backend.enums.BookCopyStatus;
import com.lms.backend.enums.FineStatus;
import com.lms.backend.enums.LoanDetailStatus;
import com.lms.backend.enums.SettingKey;
import com.lms.backend.exception.AppExcpetion;
import com.lms.backend.exception.ErrorCode;
import com.lms.backend.mapper.LoanDetailMapper;
import com.lms.backend.repository.BookCopyRepository;
import com.lms.backend.repository.FineRepository;
import com.lms.backend.repository.LoanDetailRepository;
import com.lms.backend.repository.LoanSlipRepository;
import com.lms.backend.service.LoanSlipService;
import com.lms.backend.service.ReturnService;
import com.lms.backend.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReturnServiceImpl implements ReturnService {
    private final LoanDetailRepository loanDetailRepository;
    private final LoanDetailMapper loanDetailMapper;
    private  final SystemSettingService systemSettingService;
    private final LoanSlipRepository loanSlipRepository;
    private final LoanSlipService loanSlipService;
    private final BookCopyRepository bookCopyRepository;
    private final FineRepository fineRepository;

    @Override
    public List<ReturnItemRepsonse> getReturnItems(String code) {
        if(code.startsWith("LIB")){
            return handleCardSearch(code);
        }
        else{
            return List.of(handleBarcodeSearch(code));
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void processReturnBookCopy(ReturnRequest returnRequest) {
        Set<LoanSlip> affecttedSlip = new HashSet<>();
        BigDecimal finePerDay = systemSettingService.getSettingValue(SettingKey.FINE_PER_DAY);
        BigDecimal fineByLost = systemSettingService.getSettingValue(SettingKey.FINE_BY_LOST);
        BigDecimal fineByDamage = systemSettingService.getSettingValue(SettingKey.FINE_BY_DAMAGE);

        List<Long> ids = returnRequest.getReturnItemDetailRequests().stream().map(ReturnItemDetailRequest::getLoanDetailId).toList();
        List<LoanDetail> loanDetails = loanDetailRepository.findAllById(ids);
        Long readerId = null;
        if (!loanDetails.isEmpty()) {
            readerId = loanDetails.get(0).getLoanSlip().getLibraryCard().getReader().getId();
        }
        Map<Long,LoanDetailStatus> statusMap = returnRequest.getReturnItemDetailRequests().stream()
                .collect(Collectors.toMap(ReturnItemDetailRequest::getLoanDetailId, ReturnItemDetailRequest::getStatus));
        for(LoanDetail loanDetail : loanDetails){
            affecttedSlip.add(loanDetail.getLoanSlip());

            BigDecimal totalFine = BigDecimal.ZERO;
            StringBuilder reasonBuilder = new StringBuilder();

            Long daysOverdue = caculateDaysOverdue(loanDetail.getDueDate());
            if(daysOverdue > 0){
                totalFine = finePerDay.multiply(BigDecimal.valueOf(daysOverdue));
                reasonBuilder.append(String.format("Quá hạn %d ngày; ", daysOverdue));
            }
            LoanDetailStatus status = statusMap.get(loanDetail.getId());
            BookCopy bookCopy = loanDetail.getBookCopy();
            switch (status){
                case LOST :
                    totalFine = totalFine.add(bookCopy.getBook().getPrice()).add(fineByLost);
                    reasonBuilder.append("Phạt mất sách; ");
                    bookCopy.setStatus(BookCopyStatus.LOST);
                    break;
                case DAMAGED:
                    totalFine = totalFine.add(fineByDamage);
                    reasonBuilder.append("Phạt hỏng sách; ");
                    bookCopy.setStatus(BookCopyStatus.DAMAGED);
                    break;
                default :
                    bookCopy.setStatus(BookCopyStatus.AVAILABLE);
            }
            loanDetail.setStatus(LoanDetailStatus.RETURNED);
            loanDetail.setReturnDate(LocalDate.now());
            loanDetailRepository.save(loanDetail);
            bookCopyRepository.save(bookCopy);
            if (totalFine.compareTo(BigDecimal.ZERO)>0) {
                Fine fine = new Fine();
                fine.setLoanDetail(loanDetail);
                fine.setReason(reasonBuilder.toString());
                fine.setAmount(totalFine);
                fine.setStatus(FineStatus.PENDING);
                fine.setReaderId(readerId);
                fineRepository.save(fine);
            }
        }

        for(LoanSlip loanSlip : affecttedSlip){
            loanSlipService.syncStatus(loanSlip.getId());
        }
    }
//    @Override
//    @Transactional(rollbackFor = Exception.class)
//    public void processReturnBookCopy(ReturnRequest returnRequest) {
//        Set<LoanSlip> affecttedSlip = new HashSet<>();
//        BigDecimal finePerDay = systemSettingService.getSettingValue(SettingKey.FINE_PER_DAY);
//        BigDecimal fineByLost = systemSettingService.getSettingValue(SettingKey.FINE_BY_LOST);
//        BigDecimal fineByDamage = systemSettingService.getSettingValue(SettingKey.FINE_BY_DAMAGE);
//
//        List<Long> ids = returnRequest.getReturnItemDetailRequests().stream().map(ReturnItemDetailRequest::getLoanDetailId).toList();
//        List<LoanDetail> loanDetails = loanDetailRepository.findAllById(ids);
//
//        for(ReturnItemDetailRequest request : returnRequest.getReturnItemDetailRequests()){
//            LoanDetail loanDetail = loanDetailRepository.findById(request.getLoanDetailId()).orElseThrow(()->new RuntimeException("loanDetail not found"));
//            affecttedSlip.add(loanDetail.getLoanSlip());
//
//            BigDecimal totalFine = BigDecimal.ZERO;
//            StringBuilder reasonBuilder = new StringBuilder();
//            Long daysOverdue = caculateDaysOverdue(loanDetail.getDueDate());
//            if(daysOverdue > 0){
//                totalFine = finePerDay.multiply(BigDecimal.valueOf(daysOverdue));
//                reasonBuilder.append(String.format("Quá hạn %d ngày; ", daysOverdue));
//            }
//            BookCopy bookCopy = loanDetail.getBookCopy();
//            switch (request.getStatus()){
//                case LOST :
//                    totalFine = totalFine = totalFine.add(bookCopy.getBook().getPrice()).add(fineByLost);
//                    reasonBuilder.append("Phạt mất sách; ");
//                    bookCopy.setStatus(BookCopyStatus.LOST);
//                    break;
//                case DAMAGED:
//                    totalFine = totalFine.add(fineByDamage);
//                    reasonBuilder.append("Phạt hỏng sách; ");
//                    bookCopy.setStatus(BookCopyStatus.DAMAGED);
//                    break;
//                default :
//                    bookCopy.setStatus(BookCopyStatus.AVAILABLE);
//            }
//            loanDetail.setStatus(LoanDetailStatus.RETURNED);
//            loanDetailRepository.save(loanDetail);
//            bookCopyRepository.save(bookCopy);
//            if (totalFine.compareTo(BigDecimal.ZERO)>0) {
//                Fine fine = new Fine();
//                fine.setLoanDetail(loanDetail);
//                fine.setReason(reasonBuilder.toString());
//                fine.setAmount(totalFine);
//                fine.setStatus(FineStatus.PENDING);
//                fineRepository.save(fine);
//            }
//        }
//        for(LoanSlip loanSlip : affecttedSlip){
//            loanSlipService.syncStatus(loanSlip.getId());
//        }
//    }
    @Override
    public ReturnItemRepsonse handleBarcodeSearch(String barcode) {
        LoanDetail loanDetail = loanDetailRepository.findActiveByBarcode(barcode).orElseThrow(()-> new AppExcpetion(ErrorCode.LOAN_DETAIL_NOT_FOUND));
        ReturnItemRepsonse returnItemRepsonse = mapToReturnItem(loanDetail);
        returnItemRepsonse.setEstimatedFine(calculateEstimatedFine(returnItemRepsonse.getDaysOverdue(),SettingKey.FINE_PER_DAY));
        return returnItemRepsonse;
    }

    @Override
    public List<ReturnItemRepsonse> handleCardSearch(String cardCode) {
        BigDecimal fineRate  = systemSettingService.getSettingValue(SettingKey.FINE_PER_DAY);
        List<LoanDetail> loanDetails = loanDetailRepository.findAllActiveByCardCode(cardCode);
        return loanDetails.stream()
                .map(ld -> {
                    ReturnItemRepsonse response = mapToReturnItem(ld);
                    response.setEstimatedFine(calculateEstimatedFine(response.getDaysOverdue(), fineRate));
                    return response;
                }).toList();
    }

    @Override
    public ReturnItemRepsonse mapToReturnItem(LoanDetail loanDetail) {
        long daysOverdue = caculateDaysOverdue(loanDetail.getDueDate());

        ReturnItemRepsonse returnItemRepsonse = new ReturnItemRepsonse();
        returnItemRepsonse.setId(loanDetail.getId());
        returnItemRepsonse.setBarcode(loanDetail.getBookCopy().getBarcode());
        returnItemRepsonse.setBookTitle(loanDetail.getBookCopy().getBook().getTitle());
        returnItemRepsonse.setBorrowDate(loanDetail.getLoanSlip().getBorrowDate());
        returnItemRepsonse.setDueDate(loanDetail.getDueDate());
        returnItemRepsonse.setDaysOverdue(daysOverdue);
        returnItemRepsonse.setStatus(loanDetail.getStatus());
        return returnItemRepsonse;
    }
    public BigDecimal calculateEstimatedFine(long daysOverdue, SettingKey settingKey) {
        if (daysOverdue <= 0) {
            return BigDecimal.ZERO;
        }
        return new BigDecimal(daysOverdue).multiply(systemSettingService.getSettingValue(settingKey));
    }

    public BigDecimal calculateEstimatedFine(long daysOverdue, BigDecimal rate) {
        if (daysOverdue <= 0) {
            return BigDecimal.ZERO;
        }
        return rate.multiply(BigDecimal.valueOf(daysOverdue));
    }

    @Override
    public Long caculateDaysOverdue(LocalDate dueDate) {
        return Math.max(0,ChronoUnit.DAYS.between(dueDate, LocalDate.now()));
    }
}

package com.lms.backend.service.impl;

import com.lms.backend.dto.loanSlipDto.BorrowRequest;
import com.lms.backend.dto.loanSlipDto.LoanSlipResponse;
import com.lms.backend.entity.BookCopy;
import com.lms.backend.entity.LibraryCard;
import com.lms.backend.entity.LoanDetail;
import com.lms.backend.entity.LoanSlip;
import com.lms.backend.enums.BookCopyStatus;
import com.lms.backend.enums.CardStatus;
import com.lms.backend.enums.LoanDetailStatus;
import com.lms.backend.enums.LoanStatus;
import com.lms.backend.exception.AppExcpetion;
import com.lms.backend.exception.ErrorCode;
import com.lms.backend.mapper.LoanSlipMapper;
import com.lms.backend.repository.BookCopyRepository;
import com.lms.backend.repository.LibraryCardRepository;
import com.lms.backend.repository.LoanDetailRepository;
import com.lms.backend.repository.LoanSlipRepository;
import com.lms.backend.service.LoanSlipService;
import com.lms.backend.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LoanSlipServiceImpl implements LoanSlipService {
    private final LoanSlipRepository loanSlipRepository;
    private final LoanSlipMapper loanSlipMapper;
    private final LoanDetailRepository loanDetailRepository;
    private final LibraryCardRepository libraryCardRepository;
    private final BookCopyRepository bookCopyRepository;
    private  final SystemSettingService systemSettingService;
    @Override
    public Page<LoanSlipResponse> getLoanSlips(String cardCode ,LoanStatus status, Pageable pageable) {
        Page<LoanSlip> loanSlips = loanSlipRepository.searchLoanSlips(cardCode, status, pageable);
        Page<LoanSlipResponse> loanSlipResponses = loanSlips.map(loanSlip -> loanSlipMapper.toLoanSlipResponse(loanSlip));
        return loanSlipResponses;
    }

    @Override
    public LoanSlipResponse getLoanSlipById(Long id) {
        LoanSlip loanSlip = loanSlipRepository.findById(id).orElseThrow(()->new AppExcpetion(ErrorCode.CARD_NOT_FOUND));
        return loanSlipMapper.toLoanSlipResponse(loanSlip);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public LoanSlipResponse createLoanSlip(BorrowRequest borrowRequest) {
        LibraryCard libraryCard = libraryCardRepository.findById(borrowRequest.getCardId()).orElseThrow(()->new AppExcpetion(ErrorCode.CARD_NOT_FOUND));
        if (libraryCard.getStatus()!= CardStatus.ACTIVE){
            throw new AppExcpetion(ErrorCode.CARD_LOCKED);
        }
        if(loanDetailRepository.countCurrentlyBorrowed(libraryCard.getCardCode())+borrowRequest.getBarcodes().size()>5){
            throw new AppExcpetion(ErrorCode.BORROW_LIMIT_EXCEEDED);
        };
        if (loanSlipRepository.existsByStatus(libraryCard.getCardCode(),LoanStatus.OVERDUE)){
            throw new AppExcpetion(ErrorCode.OVERDUE_LOAN_EXISTS);
        }
        LoanSlip loanSlip = new LoanSlip();
        loanSlip.setLibraryCard(libraryCard);
        loanSlip.setStatus(LoanStatus.BORROWING);
        loanSlip.setBorrowDate(LocalDateTime.now());
        List<LoanDetail> loanDetails = new ArrayList<>();
        for(String barcode : borrowRequest.getBarcodes()){
            BookCopy bookCopy = bookCopyRepository.findByBarcodeAndIsDeletedFalse(barcode).orElseThrow(()->new AppExcpetion(ErrorCode.BOOK_NOT_FOUND));
            if (bookCopy.getStatus()== BookCopyStatus.BORROWED){
                throw new AppExcpetion(ErrorCode.BOOK_COPY_UNAVAILABLE);
            }
            bookCopy.setStatus(BookCopyStatus.BORROWED);
            bookCopyRepository.save(bookCopy);
            LoanDetail loanDetail = new LoanDetail();
            loanDetail.setBookCopy(bookCopy);
            loanDetail.setLoanSlip(loanSlip);
            loanDetail.setStatus(LoanDetailStatus.BORROWING);
            loanDetail.setDueDate(borrowRequest.getDueDate());
            loanDetails.add(loanDetail);
        }
        loanSlip.setDetails(loanDetails);
        loanSlipRepository.save(loanSlip);
        return loanSlipMapper.toLoanSlipResponse(loanSlip);
    }

    @Override
    public LoanSlipResponse updateLoanSlip(LoanSlip loanSlip) {
        return null;
    }

    @Override
    public void syncStatus(long id) {
        LoanSlip loanSlip = loanSlipRepository.findById(id)
                .orElseThrow(() -> new AppExcpetion(ErrorCode.LOAN_SLIP_NOT_FOUND));

        int totalItems = loanSlip.getDetails().size();
        int completedItems = loanDetailRepository.countByLoanSlipAndStatus(loanSlip, LoanDetailStatus.RETURNED);

        if (completedItems == totalItems) {
            loanSlip.setStatus(LoanStatus.COMPLETED);
        } else if (completedItems > 0) {
            loanSlip.setStatus(LoanStatus.PARTIALLY_RETURN);
        } else {
            loanSlip.setStatus(LoanStatus.BORROWING);
        }

        loanSlipRepository.save(loanSlip);
    }
}

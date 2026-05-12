package com.lms.backend.service;

import com.lms.backend.dto.LoanDetailDto.ReturnItemRepsonse;
import com.lms.backend.dto.LoanDetailDto.ReturnRequest;
import com.lms.backend.entity.LoanDetail;
import com.lms.backend.enums.SettingKey;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ReturnService {
    public List<ReturnItemRepsonse> getReturnItems(String code);
    public void processReturnBookCopy(ReturnRequest returnRequest);
    public ReturnItemRepsonse handleBarcodeSearch(String barcode);
    public List<ReturnItemRepsonse> handleCardSearch(String cardCode);
    public ReturnItemRepsonse mapToReturnItem(LoanDetail loanDetail);
    public BigDecimal calculateEstimatedFine(long daysOverdue, SettingKey settingKey);
    public BigDecimal calculateEstimatedFine(long daysOverdue, BigDecimal rate);
    public Long caculateDaysOverdue(LocalDate dueDate);

}

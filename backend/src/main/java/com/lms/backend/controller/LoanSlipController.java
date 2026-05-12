package com.lms.backend.controller;

import com.lms.backend.common.response.ApiResponse;
import com.lms.backend.dto.loanSlipDto.BorrowRequest;
import com.lms.backend.dto.loanSlipDto.LoanSlipResponse;
import com.lms.backend.enums.LoanStatus;
import com.lms.backend.service.LoanSlipService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/loan-slips")
public class LoanSlipController {
    private final LoanSlipService loanSlipService;

    @GetMapping("{id}")
    public ResponseEntity<ApiResponse<LoanSlipResponse>> findLoanSlipById(@PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(loanSlipService.getLoanSlipById(id)));
    }
    @GetMapping("")
    public ResponseEntity<ApiResponse<Page<LoanSlipResponse>>> getLoanSlips(@RequestParam(required = false) Long cardId,@RequestParam(required = false) LoanStatus loanStatus, Pageable pageable) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(loanSlipService.getLoanSlips(cardId,loanStatus, pageable)));
    }
    @PostMapping("")
    public ResponseEntity<ApiResponse<LoanSlipResponse>> createLoanSlip(@RequestBody BorrowRequest borrowRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(loanSlipService.createLoanSlip(borrowRequest)));
    }

}

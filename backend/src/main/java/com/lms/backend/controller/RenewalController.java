package com.lms.backend.controller;

import com.lms.backend.common.response.ApiResponse;
import com.lms.backend.dto.LoanDetailDto.ActiveLoanResponse;
import com.lms.backend.dto.renewalDto.ProcessRenewalRequest;
import com.lms.backend.dto.renewalDto.RenewalRequest;
import com.lms.backend.dto.renewalDto.RenewalResponse;
import com.lms.backend.enums.RenewalStatus;
import com.lms.backend.service.RenewalService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/renewal")
@RequiredArgsConstructor
public class RenewalController {
    private final RenewalService renewallService;

    @GetMapping("{ReaderId}")
    public ResponseEntity<ApiResponse<List<ActiveLoanResponse>>> getActiveLoanResponses(@PathVariable() Long ReaderId) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(renewallService.getActiveLoans(ReaderId)));
    }

    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    @GetMapping("")
    public ResponseEntity<ApiResponse<Page<RenewalResponse>>> getRenewals(@RequestParam(required = false) RenewalStatus status, @PageableDefault(page = 0,size = 10) Pageable pageable) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(renewallService.getRenewals(status,pageable)));
    }
    @PostMapping("{id}")
    public ResponseEntity<ApiResponse<Void>> createRenewalRequest(@PathVariable Long id,@RequestBody RenewalRequest renewalRequest) {
        renewallService.createRenewalRequest(id, renewalRequest);
        return ResponseEntity.status(HttpStatus.OK).body(null);
    }

    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> processRenewal(@RequestBody ProcessRenewalRequest renewalRequest) {
        renewallService.processRenewal(renewalRequest);
        return ResponseEntity.status(HttpStatus.OK).body(null);
    }

}

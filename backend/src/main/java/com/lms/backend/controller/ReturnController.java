package com.lms.backend.controller;

import com.lms.backend.common.response.ApiResponse;
import com.lms.backend.dto.LoanDetailDto.ReturnItemRepsonse;
import com.lms.backend.dto.LoanDetailDto.ReturnRequest;
import com.lms.backend.service.ReturnService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/return")
public class ReturnController {
    private final ReturnService returnService;

    @GetMapping("/return-items")
    public ResponseEntity<ApiResponse<List<ReturnItemRepsonse>>> getReturnItems(@RequestParam String code) {
       return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(returnService.getReturnItems(code)));
    }

    @PostMapping("")
    public ResponseEntity<ApiResponse<Void>> returnProcess(@RequestBody ReturnRequest returnRequest) {
        returnService.processReturnBookCopy(returnRequest);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success());
    }

}

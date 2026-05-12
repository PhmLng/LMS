package com.lms.backend.controller;

import com.lms.backend.common.response.ApiResponse;
import com.lms.backend.dto.fineDto.FineResponse;
import com.lms.backend.enums.FineStatus;
import com.lms.backend.service.FineService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/fines")
public class FineController {
    private final FineService fineService;

    @GetMapping("")
    public ResponseEntity<ApiResponse<Page<FineResponse>>> getFinesByStatus(@RequestParam(name = "readerId") Long readerId,@RequestParam(required = false) FineStatus status, Pageable pageable) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(fineService.getFineByStatus(readerId,status, pageable)));
    }
}

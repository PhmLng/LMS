package com.lms.backend.controller;

import com.lms.backend.common.response.ApiResponse;
import com.lms.backend.dto.paymentDto.PaymentRequest;
import com.lms.backend.dto.paymentDto.PaymentResponse;
import com.lms.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/payments")
public class PaymentController {
    private final PaymentService paymentService;

    @PostMapping("/collect-cash/{id}")
    public ResponseEntity<ApiResponse<PaymentResponse>> librarianCollectCash(@PathVariable(name = "id") Long readerId, @RequestBody PaymentRequest paymentRequest) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(paymentService.processPayment(readerId,paymentRequest)));
    }
    @PostMapping("/my-payment/{id}")
    public ResponseEntity<ApiResponse<PaymentResponse>> readerProcessPayment(@PathVariable(name = "id") Long readerId,@RequestBody PaymentRequest paymentRequest){
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(paymentService.processPayment(readerId,paymentRequest)));
    }
}

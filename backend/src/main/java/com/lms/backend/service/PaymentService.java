package com.lms.backend.service;

import com.lms.backend.dto.paymentDto.PaymentRequest;
import com.lms.backend.dto.paymentDto.PaymentResponse;
import com.lms.backend.entity.Payment;

public interface PaymentService {
    public PaymentResponse processPayment(Long readerId,PaymentRequest paymentRequest);
}

package com.lms.backend.dto.paymentDto;

import com.lms.backend.enums.PaymentMethod;
import com.lms.backend.enums.PaymentStatus;
import lombok.Data;


import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentResponse {
    private Long id;
    private Long readerId;
    private String transactionCode;
    private PaymentStatus paymentStatus;
    private PaymentMethod paymentMethod;
    private BigDecimal amount;
    private LocalDateTime createdAt;
}

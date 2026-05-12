package com.lms.backend.dto.paymentDto;

import com.lms.backend.enums.PaymentMethod;
import lombok.Data;

import java.util.List;

@Data
public class PaymentRequest {
    private List<Long> fineIds;
    private PaymentMethod paymentMethod;
}

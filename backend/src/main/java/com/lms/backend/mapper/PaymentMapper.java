package com.lms.backend.mapper;

import com.lms.backend.dto.paymentDto.PaymentResponse;
import com.lms.backend.entity.Payment;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PaymentMapper {
    PaymentResponse toPaymentResponse(Payment payment);
}

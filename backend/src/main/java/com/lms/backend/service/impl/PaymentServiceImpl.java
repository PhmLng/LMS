package com.lms.backend.service.impl;

import com.lms.backend.dto.paymentDto.PaymentRequest;
import com.lms.backend.dto.paymentDto.PaymentResponse;
import com.lms.backend.entity.Fine;
import com.lms.backend.entity.Payment;
import com.lms.backend.enums.FineStatus;
import com.lms.backend.enums.PaymentStatus;
import com.lms.backend.exception.AppExcpetion;
import com.lms.backend.exception.ErrorCode;
import com.lms.backend.mapper.PaymentMapper;
import com.lms.backend.repository.FineRepository;
import com.lms.backend.repository.PaymentRepository;
import com.lms.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;
    private final FineRepository fineRepository;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PaymentResponse processPayment(Long readerId,PaymentRequest paymentRequest) {
        if (paymentRequest.getFineIds() == null || paymentRequest.getFineIds().isEmpty()) {
            throw new AppExcpetion(ErrorCode.PAYMENT_LIST_MISSING);
        }

        List<Fine> fines = fineRepository.findAllById(paymentRequest.getFineIds());
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (Fine fine : fines) {
            totalAmount = totalAmount.add(fine.getAmount());
        }

        Payment payment = new Payment();
        payment.setPaymentMethod(paymentRequest.getPaymentMethod());
        payment.setReaderId(readerId);
        payment.setAmount(totalAmount);
        payment.setFines(fines);
        payment.setPaymentStatus(PaymentStatus.SUCCESS);
        payment.setTransactionCode("LIB_MOCK"+ System.currentTimeMillis());
        payment.setCreatedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        for (Fine fine : fines) {
            fine.setStatus(FineStatus.PAID);
            fine.setPayment(payment);
        }
        fineRepository.saveAll(fines);

        return paymentMapper.toPaymentResponse(payment);
    }
}

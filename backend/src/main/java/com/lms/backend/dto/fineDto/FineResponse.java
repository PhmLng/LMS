package com.lms.backend.dto.fineDto;

import com.lms.backend.entity.LoanDetail;
import com.lms.backend.entity.Payment;
import com.lms.backend.enums.FineStatus;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class FineResponse {
    private Long id;
    private BigDecimal amount;
    private String reason;
    private Long readerId;
    private FineStatus status;
    private String bookTitle;
    private LocalDateTime createdAt;
}

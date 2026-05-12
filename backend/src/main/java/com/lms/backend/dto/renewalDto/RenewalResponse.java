package com.lms.backend.dto.renewalDto;

import com.lms.backend.entity.LoanDetail;
import com.lms.backend.enums.RenewalStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class RenewalResponse {
    private Long id;
    private LocalDate requestDate;
    private LocalDate oldDueDate;
    private LocalDate newDate;
    private RenewalStatus status;
    private String bookTitle;
}

package com.lms.backend.dto.readerDto;

import com.lms.backend.enums.CardStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReaderResponse {
    private Long id;
    private String fullName;
    private String phoneNumber;
    private String email;
    private String cardCode;
    private CardStatus cardStatus;
    private LocalDateTime expiryDate;
}

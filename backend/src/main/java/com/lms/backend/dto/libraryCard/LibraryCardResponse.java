package com.lms.backend.dto.libraryCard;

import com.lms.backend.enums.CardStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class LibraryCardResponse {
    private String cardCode;
    private LocalDateTime issueDate;
    private LocalDateTime expiryDate;
    private CardStatus status;
    private String readerName;
}

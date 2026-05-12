package com.lms.backend.dto.libraryCard;

import com.lms.backend.enums.CardStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class LibraryCardUpdateRequest {
    private LocalDateTime expiryDate;
    private CardStatus status;
}

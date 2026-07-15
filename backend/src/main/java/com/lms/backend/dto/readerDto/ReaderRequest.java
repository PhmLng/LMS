package com.lms.backend.dto.readerDto;

import com.lms.backend.dto.accountDto.AccountRequest;
import com.lms.backend.dto.libraryCard.LibraryCardRequest;
import jakarta.persistence.Column;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ReaderRequest {
    private String fullName;
    private String email;
    private String phoneNumber;
    private String address;
    private String gender;
    private LocalDate dateOfBirth;
}

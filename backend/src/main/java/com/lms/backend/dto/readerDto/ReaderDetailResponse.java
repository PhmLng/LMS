package com.lms.backend.dto.readerDto;

import com.lms.backend.dto.accountDto.AccountResponse;
import com.lms.backend.dto.libraryCard.LibraryCardResponse;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ReaderDetailResponse {
    private String fullName;
    private String email;
    private String phoneNumber;
    private String address;
    private String gender;
    private LocalDate dateOfBirth;
    private LibraryCardResponse libraryCardResponse;
    private AccountResponse accountResponse;
}

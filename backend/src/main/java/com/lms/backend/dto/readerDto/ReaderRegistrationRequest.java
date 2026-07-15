package com.lms.backend.dto.readerDto;

import com.lms.backend.dto.accountDto.AccountRequest;
import com.lms.backend.dto.libraryCard.LibraryCardRequest;
import lombok.Data;

@Data
public class ReaderRegistrationRequest {
    private ReaderRequest readerRequest;
    private AccountRequest accountRequest;
    private LibraryCardRequest libraryCardRequest;
}

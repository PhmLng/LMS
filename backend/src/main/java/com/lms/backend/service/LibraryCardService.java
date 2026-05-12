package com.lms.backend.service;

import com.lms.backend.dto.libraryCard.LibraryCardRequest;
import com.lms.backend.dto.libraryCard.LibraryCardResponse;
import com.lms.backend.dto.libraryCard.LibraryCardUpdateRequest;
import com.lms.backend.enums.CardStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface LibraryCardService {
    public Page<LibraryCardResponse> getLibraryCards(CardStatus status,Pageable pageable);
    public LibraryCardResponse getLibraryCardById(Long id);
    public LibraryCardResponse createLibraryCard(LibraryCardRequest libraryCardRequest);
    public LibraryCardResponse updateLibraryCard(Long id,LibraryCardUpdateRequest libraryCardUpdateRequest);
    public String generateCardCode();
}

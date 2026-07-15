package com.lms.backend.service;

import com.lms.backend.dto.readerDto.ReaderDetailResponse;
import com.lms.backend.dto.readerDto.ReaderRequest;
import com.lms.backend.dto.readerDto.ReaderResponse;
import com.lms.backend.dto.readerDto.ReaderUpdateRequest;
import com.lms.backend.entity.Account;
import com.lms.backend.entity.LibraryCard;
import com.lms.backend.entity.Reader;
import com.lms.backend.enums.CardStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReaderService {
    public Page<ReaderResponse> getAllReaders(Pageable pageable, CardStatus cardStatus, String fullName);
    public ReaderDetailResponse getReaderById(Long readerId);
    public Reader createReader(ReaderRequest readerRequest, Account account, LibraryCard libraryCard);
    public ReaderDetailResponse updateReader(ReaderUpdateRequest readerUpdateRequest, Long readerId);
    public void lockReader(Long readerId);
    public void unlockReader(Long readerId);
}

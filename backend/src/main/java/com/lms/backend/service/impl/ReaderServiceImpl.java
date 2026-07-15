package com.lms.backend.service.impl;

import com.lms.backend.dto.readerDto.ReaderRequest;
import com.lms.backend.dto.readerDto.ReaderDetailResponse;
import com.lms.backend.dto.readerDto.ReaderResponse;
import com.lms.backend.dto.readerDto.ReaderUpdateRequest;
import com.lms.backend.entity.Account;
import com.lms.backend.entity.LibraryCard;
import com.lms.backend.entity.Reader;
import com.lms.backend.enums.AccountStatus;
import com.lms.backend.enums.CardStatus;
import com.lms.backend.mapper.ReaderMapper;
import com.lms.backend.repository.AccountRepository;
import com.lms.backend.repository.LibraryCardRepository;
import com.lms.backend.repository.ReaderRepository;
import com.lms.backend.service.AccountService;
import com.lms.backend.service.LibraryCardService;
import com.lms.backend.service.ReaderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReaderServiceImpl implements ReaderService {
    private final ReaderRepository readerRepository;
    private final ReaderMapper readerMapper;
    private final AccountService accountService;
    private final AccountRepository accountRepository;
    private final LibraryCardService libraryCardService;
    private final LibraryCardRepository libraryCardRepository;
    @Override
    public Page<ReaderResponse> getAllReaders(Pageable pageable, CardStatus cardStatus, String fullName) {
        Page<Reader> readers = readerRepository.findAllReader(pageable,cardStatus,fullName);
        return readers.map(readerMapper::toReaderResponse);
    }

    @Override
    public ReaderDetailResponse getReaderById(Long readerId) {
        Reader reader = readerRepository.findById(readerId).orElseThrow();
        return readerMapper.toReaderDetailResponse(reader);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Reader createReader(ReaderRequest readerRequest,Account account, LibraryCard libraryCard) {
        Reader reader = readerMapper.toReader(readerRequest);
        reader.setAccount(account);
        reader.setLibraryCard(libraryCard);
        libraryCard.setReader(reader);
        readerRepository.save(reader);
        return reader;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ReaderDetailResponse updateReader(ReaderUpdateRequest readerUpdateRequest, Long readerId) {
        Reader reader = readerRepository.findById(readerId).orElse(null);
        readerMapper.updateReader(reader,readerUpdateRequest.getReaderRequest());

        LibraryCard libraryCard = reader.getLibraryCard();
        libraryCardService.updateLibraryCard(libraryCard.getId(),readerUpdateRequest.getLibraryCardUpdateRequest());

        readerRepository.save(reader);
        return readerMapper.toReaderDetailResponse(reader);
    }

    @Override
    public void lockReader(Long readerId) {
        Reader reader = readerRepository.findById(readerId).orElse(null);
        reader.getLibraryCard().setStatus(CardStatus.LOCKED);
        reader.getAccount().setStatus(AccountStatus.INACTIVE);
        readerRepository.save(reader);
    }

    @Override
    public void unlockReader(Long readerId) {
        Reader reader = readerRepository.findById(readerId).orElse(null);
        reader.getLibraryCard().setStatus(CardStatus.ACTIVE);
        reader.getAccount().setStatus(AccountStatus.ACTIVE);
        readerRepository.save(reader);
    }
}

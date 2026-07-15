package com.lms.backend.service.impl;

import com.lms.backend.dto.libraryCard.LibraryCardRequest;
import com.lms.backend.dto.libraryCard.LibraryCardResponse;
import com.lms.backend.dto.libraryCard.LibraryCardUpdateRequest;
import com.lms.backend.entity.LibraryCard;
import com.lms.backend.entity.Reader;
import com.lms.backend.enums.CardStatus;
import com.lms.backend.mapper.LibraryCardMapper;
import com.lms.backend.repository.LibraryCardRepository;
import com.lms.backend.repository.ReaderRepository;
import com.lms.backend.service.LibraryCardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class LibraryCardServiceImpl implements LibraryCardService {
    private final LibraryCardRepository libraryCardRepository;
    private final ReaderRepository readerRepository;
    private final LibraryCardMapper libraryCardMapper;
    @Override
    public Page<LibraryCardResponse> getLibraryCards(CardStatus cardStatus,Pageable pageable) {
        Page<LibraryCard> libraryCards;
        if ((cardStatus !=null)){
            libraryCards = libraryCardRepository.findAllByStatus(cardStatus,pageable).orElseThrow(()->new RuntimeException(cardStatus+" is not found"));
        }
        else {
            libraryCards = libraryCardRepository.findAll(pageable);
        }
        Page<LibraryCardResponse> libraryCardResponses = libraryCards.map(libraryCard -> libraryCardMapper.toLibraryCardResponse(libraryCard));
        return libraryCardResponses;
    }

    @Override
    public LibraryCardResponse getLibraryCardById(Long id) {
        LibraryCard libraryCard = libraryCardRepository.findById(id).orElseThrow(()-> new RuntimeException("No library card found with id"));
        return libraryCardMapper.toLibraryCardResponse(libraryCard);
    }

    @Override
    public LibraryCardResponse getLibraryCardByCardCode(String cardCode) {
        LibraryCard libraryCard = libraryCardRepository.findByCardCode(cardCode).orElseThrow(() -> new RuntimeException("Card is not found"));
        return libraryCardMapper.toLibraryCardResponse(libraryCard);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public LibraryCard createLibraryCard(LibraryCardRequest libraryCardRequest) {
        LibraryCard libraryCard = libraryCardMapper.toLibraryCard(libraryCardRequest);
        if (libraryCardRequest.getCardCode() == null || libraryCardRequest.getCardCode().isBlank()) {
            libraryCard.setCardCode(generateCardCode());
        }
        else {
            if (libraryCardRepository.existsByCardCode(libraryCardRequest.getCardCode())) {
                throw new RuntimeException("card code already exists");
            }
        }
//        Reader reader = readerRepository.findById(libraryCardRequest.getReaderId()).orElseThrow(()->new RuntimeException("reader not found"));
//        libraryCard.setReader(reader);
//        libraryCardRepository.save(libraryCard);
        return libraryCard;
    }

    @Override
    public LibraryCardResponse updateLibraryCard(Long id,LibraryCardUpdateRequest libraryCardUpdateRequest) {
        LibraryCard libraryCard = libraryCardRepository.findById(id).orElseThrow(()->new RuntimeException("No library card found with id"));
        libraryCardMapper.updateLibraryCard(libraryCard,libraryCardUpdateRequest);
        return libraryCardMapper.toLibraryCardResponse(libraryCard);
    }

    @Override
    public String generateCardCode() {
        String yearPrefix = "LIB" + (LocalDate.now().getYear() % 100);
        String maxCode = libraryCardRepository.findMaxCardCodeByPrefix(yearPrefix + "%");
        int nextNumber = 1;
        if (maxCode != null) {
            String numberPart = maxCode.substring(yearPrefix.length());
            nextNumber = Integer.parseInt(numberPart) + 1;
        }
        return yearPrefix + String.format("%04d", nextNumber);
    }
}

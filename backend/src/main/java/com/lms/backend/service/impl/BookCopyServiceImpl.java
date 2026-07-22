package com.lms.backend.service.impl;

import com.lms.backend.dto.BookCopyDto.*;
import com.lms.backend.entity.Book;
import com.lms.backend.entity.BookCopy;
import com.lms.backend.enums.BookCopyStatus;
import com.lms.backend.exception.AppExcpetion;
import com.lms.backend.exception.ErrorCode;
import com.lms.backend.mapper.BookCopyMapper;
import com.lms.backend.repository.BookCopyRepository;
import com.lms.backend.repository.BookRepository;
import com.lms.backend.service.BookCopyService;
import com.lms.backend.service.BookService;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BookCopyServiceImpl implements BookCopyService {

    private final BookCopyRepository bookCopyRepository;
    private final BookCopyMapper bookCopyMapper;
    private final BookRepository bookRepository;

    @Override
    public Page<BookCopyResponse> getAllBookCopy(Pageable pageable) {
        Page<BookCopy> bookCopies = bookCopyRepository.findAllByIsDeletedFalse(pageable);
        Page<BookCopyResponse> bookCopyResponses = bookCopies.map(bookCopy -> bookCopyMapper.toBookCopyResponse(bookCopy));
        return bookCopyResponses;
    }

    @Override
    public BookCopyDetailResponse getBookCopyById(long id) {
        BookCopy bookCopy = bookCopyRepository.findById(id).orElseThrow(() -> new AppExcpetion(ErrorCode.BOOK_NOT_FOUND));
        return bookCopyMapper.toBookCopyDetailResponse(bookCopy);
    }

    @Override
    public BookCopyResponse getBookCopyByBarcode(String barcode) {
        System.out.println(barcode);
        BookCopy bookCopy = bookCopyRepository.findByBarcodeAndIsDeletedFalse(barcode).orElseThrow(()->new AppExcpetion(ErrorCode.BOOK_NOT_FOUND));

        return bookCopyMapper.toBookCopyResponse(bookCopy);
    }

    @Override
    public Page<BookCopyResponse> searchBookCopy(FilterBookCopyRequest filterBookCopyRequest, Pageable pageable) {
        System.out.println("Check request data: " + filterBookCopyRequest.getBookId() + " - " + filterBookCopyRequest.getStatus());
        Page<BookCopy> bookCopies = bookCopyRepository.searchBookCopy(filterBookCopyRequest.getStatus(), filterBookCopyRequest.getBookId(), pageable);
        Page<BookCopyResponse> bookCopyResponses = bookCopies.map(bookCopy -> bookCopyMapper.toBookCopyResponse(bookCopy));
        return bookCopyResponses;
    }

    @Override
    public BookCopyResponse createBookCopy(BookCopyRequest bookCopyRequest) {
        Book book = bookRepository.findById(bookCopyRequest.getBookId()).orElseThrow(() -> new AppExcpetion(ErrorCode.BOOK_NOT_FOUND));
        if (bookCopyRequest.getBarcode()==null || bookCopyRequest.getBarcode().isBlank()){
            bookCopyRequest.setBarcode(generateBarcode(bookCopyRequest.getBookId()));
        }
        else {
            if(bookCopyRepository.existsByBarcode(bookCopyRequest.getBarcode())){
                throw new AppExcpetion(ErrorCode.BOOK_NOT_FOUND);
            }
        }
        BookCopy bookCopy = bookCopyMapper.toBookCopy(bookCopyRequest);
        bookCopy.setBook(book);
        bookCopyRepository.save(bookCopy);
        return bookCopyMapper.toBookCopyResponse(bookCopy);
    }

    @Override
    public BookCopyResponse updateBookCopy(Long id,BookCopyUpdateRequest bookCopyUpdateRequest) {
        BookCopy bookCopy = bookCopyRepository.findById(id).orElseThrow(() -> new AppExcpetion(ErrorCode.BOOK_NOT_FOUND));
        if(!bookCopyUpdateRequest.getBookId().equals(bookCopy.getBook().getId())) {
            Book book = bookRepository.findById(bookCopy.getBook().getId()).orElseThrow(() -> new AppExcpetion(ErrorCode.BOOK_NOT_FOUND));
            bookCopy.setBook(book);
        }
        bookCopyMapper.updateBookCopy(bookCopy, bookCopyUpdateRequest);
        return bookCopyMapper.toBookCopyResponse(bookCopy);
    }

    @Override
    public void deleteBookCopy(long id) {
        BookCopy bookCopy = bookCopyRepository.findById(id).orElseThrow(() -> new AppExcpetion(ErrorCode.BOOK_NOT_FOUND));
        bookCopy.setDeleted(true);
        bookCopyRepository.save(bookCopy);
    }

    @Override
    public String generateBarcode(Long bookId) {
        Long bookCopyQuantity = bookCopyRepository.countByBookId(bookId);
        Long nextNumber = bookCopyQuantity + 1;
        String barcode =  String.format("BC-%02d-%05d", bookId, nextNumber);
        return barcode;
    }
}

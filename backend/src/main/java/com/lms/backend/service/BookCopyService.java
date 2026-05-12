package com.lms.backend.service;

import com.lms.backend.dto.BookCopyDto.*;
import com.lms.backend.dto.bookDto.BookDetailResponse;
import com.lms.backend.entity.BookCopy;
import com.lms.backend.enums.BookCopyStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BookCopyService {
    public Page<BookCopyResponse> getAllBookCopy(Pageable pageable);
    public BookCopyDetailResponse getBookCopyById(long id);
    public BookCopyResponse getBookCopyByBarcode(String barcode);
    public Page<BookCopyResponse> searchBookCopy(FilterBookCopyRequest filterBookCopyRequest, Pageable pageable);
    public BookCopyResponse createBookCopy(BookCopyRequest bookCopy);
    public BookCopyResponse updateBookCopy(Long id ,BookCopyUpdateRequest bookCopyUpdateRequest);
    public void deleteBookCopy(long id);
    public String generateBarcode(Long bookId);
}

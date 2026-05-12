package com.lms.backend.service;

import com.lms.backend.dto.bookDto.BookDetailResponse;
import com.lms.backend.dto.bookDto.BookRequest;
import com.lms.backend.dto.bookDto.BookResponse;
import com.lms.backend.dto.bookDto.FilterBookRequest;
import com.lms.backend.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BookService {
    public Page<BookResponse> getAllBooks(Pageable pageable);
    public BookDetailResponse getBookById (Long id);
    public BookResponse createBook (BookRequest bookRequest);
    public BookResponse updateBook (Long id,BookRequest bookRequest);
    public void deleteBook (Long id);
    public Page<BookResponse> searchBook (FilterBookRequest filter, Pageable pageable);
}

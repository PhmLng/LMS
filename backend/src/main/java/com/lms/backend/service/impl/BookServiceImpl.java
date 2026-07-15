package com.lms.backend.service.impl;

import com.lms.backend.dto.bookDto.BookDetailResponse;
import com.lms.backend.dto.bookDto.BookRequest;
import com.lms.backend.dto.bookDto.BookResponse;
import com.lms.backend.dto.bookDto.FilterBookRequest;
import com.lms.backend.entity.Author;
import com.lms.backend.entity.Book;
import com.lms.backend.entity.Category;
import com.lms.backend.entity.Publisher;
import com.lms.backend.mapper.BookMapper;
import com.lms.backend.repository.*;
import com.lms.backend.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookServiceImpl implements BookService {

    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;
    private final BookMapper bookMapper;
    private final AuthorRepository authorRepository;
    private final CategoryRepository categoryRepository;
    private final PublisherRepository publisherRepository;

    @Override
    public Page<BookResponse> getAllBooks(Pageable pageable) {
        Page<Book> books = bookRepository.findAllByIsDeletedFalse(pageable);
        Page<BookResponse> bookResponses = books.map((book -> {
            BookResponse bookResponse = bookMapper.toBookResponse(book);
            int quantity = bookCopyRepository.countByBookIdAndIsDeleted(book.getId(), false);
            int borrowedQuantity = bookCopyRepository.countRemainingQuantity(book.getId());
            bookResponse.setQuantity(quantity);
            bookResponse.setRemainingQuantity(quantity - borrowedQuantity);
            return bookResponse;
        }));
        return bookResponses;
    }

    @Override
    public BookDetailResponse getBookById(Long id) {
        Book book = bookRepository.findById(id).orElseThrow(()->new RuntimeException("Book not found"));
        return bookMapper.toBookDetailResponse(book);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public BookResponse createBook(BookRequest bookRequest) {
        Book book = bookMapper.toBook(bookRequest);
        for (Long categoryId : bookRequest.getCategoryIds()) {
            System.out.println(categoryId+" ");
        }
        Author author = authorRepository.findById(bookRequest.getAuthorId()).orElseThrow(()->new RuntimeException("Author not found"));
        Publisher publisher = publisherRepository.findById(bookRequest.getPublisherId()).orElseThrow(() -> new RuntimeException("Publisher not found"));
        List<Category> categories = categoryRepository.findAllById(bookRequest.getCategoryIds());
        if(categories.size() != bookRequest.getCategoryIds().size()){
            throw new RuntimeException("one or more categories not found");
        }
        book.setAuthor(author);
        book.setPublisher(publisher);
        book.setCategories(categories);
        bookRepository.save(book);
        return bookMapper.toBookResponse(book);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public BookResponse updateBook(Long id,BookRequest bookRequest) {
        Book book = bookRepository.findById(id).orElseThrow(()->new RuntimeException("Book not found"));
        bookMapper.updateBook(book, bookRequest);
        if(book.getAuthor().getId() != bookRequest.getAuthorId()){
            Author author = authorRepository.findById(bookRequest.getAuthorId()).orElseThrow(()->new RuntimeException("Author not found"));
            book.setAuthor(author);
        }
        if(book.getPublisher().getId() != bookRequest.getPublisherId()){
            Publisher publisher = publisherRepository.findById(bookRequest.getPublisherId()).orElseThrow(() -> new RuntimeException("Publisher not found"));
            book.setPublisher(publisher);
        }
        List<Category> categories = categoryRepository.findAllById(bookRequest.getCategoryIds());
        if(categories.size() != bookRequest.getCategoryIds().size()){
            throw new RuntimeException("one or more categories not found");
        }
        book.setCategories(categories);
        bookRepository.save(book);
        return bookMapper.toBookResponse(book);
    }

    @Override
    public void deleteBook(Long id) {
        Book book = bookRepository.findById(id).orElseThrow(()->new RuntimeException("Book not found"));
        book.setIsDeleted(true);
        bookRepository.save(book);
    }

    @Override
    public Page<BookResponse> searchBook(FilterBookRequest filter, Pageable pageable) {
        Page<Book> books = bookRepository.filterBooks(filter.getTitle(), filter.getCategoryId(), filter.getPublishId(),filter.getStatus(), filter.getAuthorId(), pageable);
        return books.map((book -> {
            BookResponse bookResponse = bookMapper.toBookResponse(book);

            int quantity = bookCopyRepository.countByBookIdAndIsDeleted(book.getId(), false);
            int borrowedQuantity = bookCopyRepository.countRemainingQuantity(book.getId());
            bookResponse.setQuantity(quantity);
            bookResponse.setRemainingQuantity(quantity - borrowedQuantity);
            return bookResponse;
        }));
    }
}

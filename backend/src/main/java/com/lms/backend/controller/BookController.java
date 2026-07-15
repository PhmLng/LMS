package com.lms.backend.controller;

import com.lms.backend.common.response.ApiResponse;
import com.lms.backend.dto.bookDto.BookDetailResponse;
import com.lms.backend.dto.bookDto.BookRequest;
import com.lms.backend.dto.bookDto.BookResponse;
import com.lms.backend.dto.bookDto.FilterBookRequest;
import com.lms.backend.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/books")
@RequiredArgsConstructor
public class BookController {
    private final BookService bookService;

    @GetMapping("")
    public ResponseEntity<ApiResponse<Page<BookResponse>>> getAllBooks(@PageableDefault(page = 0, size = 10,sort = "id",direction = Sort.Direction.DESC) Pageable pageable) {
        return  ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(bookService.getAllBooks(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookDetailResponse>> getBookById(@PathVariable long id) {
        return  ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(bookService.getBookById(id)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<BookResponse>>> searchBooks(FilterBookRequest filterBookRequest,
                                                          @PageableDefault(page = 0, size = 10,sort = "id",direction = Sort.Direction.DESC) Pageable pageable
                                                          ) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(bookService.searchBook(filterBookRequest, pageable)));
    }

    @PreAuthorize("hasAuthority('BOOK_CREATE')")
    @PostMapping("")
    public ResponseEntity<ApiResponse<BookResponse>> creatBoook(@RequestBody BookRequest bookRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(bookService.createBook(bookRequest)));
    }
    @PreAuthorize("hasAuthority('BOOK_UPDATE')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BookResponse>> updateBoook(@PathVariable Long id,@RequestBody BookRequest bookRequest) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(bookService.updateBook(id,bookRequest)));
    }

    @PreAuthorize("hasAuthority('BOOK_DELETE')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>>deleteBook(@PathVariable long id) {
        bookService.deleteBook(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(ApiResponse.success());
    }
}

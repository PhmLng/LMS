package com.lms.backend.controller;

import com.lms.backend.common.response.ApiResponse;
import com.lms.backend.dto.BookCopyDto.*;
import com.lms.backend.service.BookCopyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/book-copies")
public class BookCopyController {
    private final BookCopyService bookCopyService;

    @GetMapping("")
    public ResponseEntity<ApiResponse<Page<BookCopyResponse>>> getAllBookCopies(Pageable pageable) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(bookCopyService.getAllBookCopy(pageable)));
    }
    @GetMapping("{id}")
    public ResponseEntity<ApiResponse<BookCopyDetailResponse>> getBookCopyById(@PathVariable("id") Long id) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(bookCopyService.getBookCopyById(id)));
    }
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<BookCopyResponse>>> saerchBoookCopies(FilterBookCopyRequest filterBookCopyRequest, Pageable pageable) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(bookCopyService.searchBookCopy(filterBookCopyRequest,pageable)));
    }
    @PostMapping("")
    public ResponseEntity<ApiResponse<BookCopyResponse>> createBookCopy(@RequestBody BookCopyRequest bookCopyRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(bookCopyService.createBookCopy(bookCopyRequest)));
    }
    @PutMapping("{id}")
    public ResponseEntity<ApiResponse<BookCopyResponse>> updateBookCopy(@PathVariable Long id,@RequestBody BookCopyUpdateRequest bookCopyUpdateRequest) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(bookCopyService.updateBookCopy(id,bookCopyUpdateRequest)));
    }
    @DeleteMapping("{id}")
    public ResponseEntity<ApiResponse<BookCopyResponse>> deleteBookCopy(@PathVariable Long id) {
        bookCopyService.deleteBookCopy(id);
        return  ResponseEntity.status(HttpStatus.NO_CONTENT).body(ApiResponse.success());
    }
}

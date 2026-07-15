package com.lms.backend.controller;

import com.lms.backend.common.response.ApiResponse;
import com.lms.backend.dto.authorDto.AuthorRequest;
import com.lms.backend.dto.authorDto.AuthorResponse;
import com.lms.backend.entity.Author;
import com.lms.backend.service.AuthorService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/authors")
@PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
public class AuthorController {
    private final AuthorService authorService;

    @GetMapping("")
    public ResponseEntity<ApiResponse<Page<AuthorResponse>>> findAllAuthors(@PageableDefault(page = 0, size = 10) Pageable pageable, @RequestParam(required = false) String name) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(authorService.getAllAuthors(pageable, name)));
    }
    @GetMapping("{id}")
    public ResponseEntity<ApiResponse<AuthorResponse>> getAuthorById(@PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(authorService.getAuthorById(id)));
    }

    @PostMapping("")
    public ResponseEntity<ApiResponse<AuthorResponse>> createAuthor(@RequestBody AuthorRequest authorRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(authorService.createAuthor(authorRequest)));
    }
    @PutMapping("{id}")
    public ResponseEntity<ApiResponse<AuthorResponse>> updateAuthor(@PathVariable Long id, @RequestBody AuthorRequest authorRequest) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(authorService.updateAuthor(id, authorRequest)));
    }
}

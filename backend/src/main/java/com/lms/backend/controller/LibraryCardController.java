package com.lms.backend.controller;

import com.lms.backend.common.response.ApiResponse;
import com.lms.backend.dto.libraryCard.LibraryCardRequest;
import com.lms.backend.dto.libraryCard.LibraryCardResponse;
import com.lms.backend.dto.libraryCard.LibraryCardUpdateRequest;
import com.lms.backend.entity.LibraryCard;
import com.lms.backend.enums.CardStatus;
import com.lms.backend.service.LibraryCardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/library-cards")
public class LibraryCardController {
    private final LibraryCardService libraryCardService;

    @GetMapping("")
    public ResponseEntity<ApiResponse<Page<LibraryCardResponse>>> getLibraryCards(@RequestParam(required = false) CardStatus status,Pageable pageable) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(libraryCardService.getLibraryCards(status, pageable)));
    }
    @GetMapping("{id}")
    public ResponseEntity<ApiResponse<LibraryCardResponse>> getLibraryCardById(@PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(libraryCardService.getLibraryCardById(id)));
    }
    @PostMapping("")
    public ResponseEntity<ApiResponse<LibraryCardResponse>> createLibraryCard(@RequestBody LibraryCardRequest libraryCardRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(libraryCardService.createLibraryCard(libraryCardRequest)));
    }
    @PutMapping("{id}")
    public ResponseEntity<ApiResponse<LibraryCardResponse>> updateLibraryCard(@PathVariable Long id,@RequestBody LibraryCardUpdateRequest libraryCardUpdateRequest) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(libraryCardService.updateLibraryCard(id,libraryCardUpdateRequest)));
    }
}

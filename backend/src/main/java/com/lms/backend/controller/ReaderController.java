package com.lms.backend.controller;

import com.lms.backend.common.response.ApiResponse;
import com.lms.backend.dto.readerDto.ReaderDetailResponse;
import com.lms.backend.dto.readerDto.ReaderRegistrationRequest;
import com.lms.backend.dto.readerDto.ReaderResponse;
import com.lms.backend.dto.readerDto.ReaderUpdateRequest;
import com.lms.backend.enums.CardStatus;
import com.lms.backend.service.ReaderService;
import com.lms.backend.service.RegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/readers")
@PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
public class ReaderController {
    private final RegistrationService readerRegistrationService;
    private final ReaderService readerService;

    @GetMapping("")
    public ResponseEntity<ApiResponse<Page<ReaderResponse>>> getAllReaders(Pageable pageable, @RequestParam(required = false) CardStatus cardStatus, @RequestParam(required = false) String fullName) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(readerService.getAllReaders(pageable,cardStatus,fullName)));
    }
    @GetMapping("{id}")
    public ResponseEntity<ApiResponse<ReaderDetailResponse>> getReaderById(@PathVariable(name = "id") Long id) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(readerService.getReaderById(id)));
    }
    @PostMapping("")
    public ResponseEntity<ApiResponse<ReaderDetailResponse>> creatReader(@RequestBody ReaderRegistrationRequest readerRegistrationRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(readerRegistrationService.registerNewReader(readerRegistrationRequest)));
    }

    @PutMapping("{id}")
    public ResponseEntity<ApiResponse<ReaderDetailResponse>> updateReader(@RequestBody ReaderUpdateRequest readerUpdateRequest, @PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(readerService.updateReader(readerUpdateRequest,id)));
    }
    @PutMapping("/{id}/lock")
    public ResponseEntity<ApiResponse<Void>> lockReader(@PathVariable Long id) {
        readerService.lockReader(id);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success());
    }
    @PutMapping("/{id}/unlock")
    public ResponseEntity<ApiResponse<Void>> unlockReader(@PathVariable Long id) {
        readerService.unlockReader(id);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success());
    }
}

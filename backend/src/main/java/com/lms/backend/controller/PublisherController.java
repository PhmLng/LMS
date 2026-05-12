package com.lms.backend.controller;

import com.lms.backend.common.response.ApiResponse;
import com.lms.backend.dto.publisherDto.PublisherRequest;
import com.lms.backend.dto.publisherDto.PublisherResponse;
import com.lms.backend.service.PublisherService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/publishers")
public class PublisherController {

    private final PublisherService publisherService;

    @GetMapping("")
    public ResponseEntity<ApiResponse<Page<PublisherResponse>>> getAllPublishers(@PageableDefault(page = 0, size = 10) Pageable pageable){
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(publisherService.getAllPublishers(pageable)));
    }
    @GetMapping("{id}")
    public ResponseEntity<ApiResponse<PublisherResponse>> getPublisherById(@PathVariable Long id){
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(publisherService.getPublisherById(id)));
    }
    @PostMapping("")
    public ResponseEntity<ApiResponse<PublisherResponse>> createPublisher(@RequestBody PublisherRequest publisherRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(publisherService.createPublisher(publisherRequest)));
    }
    @PutMapping("{id}")
    public ResponseEntity<ApiResponse<PublisherResponse>> updatePublisher(@PathVariable Long id,@RequestBody PublisherRequest publisherRequest) {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(publisherService.updatePublisher(id,publisherRequest)));
    }
}

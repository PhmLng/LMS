package com.lms.backend.service;


import com.lms.backend.dto.publisherDto.PublisherRequest;
import com.lms.backend.dto.publisherDto.PublisherResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PublisherService {
    public Page<PublisherResponse> getAllPublishers(Pageable pageable,String name);
    public PublisherResponse getPublisherById(Long id);
    public PublisherResponse createPublisher(PublisherRequest publisherRequest);
    public PublisherResponse updatePublisher(Long id,PublisherRequest publisherRequest );
}

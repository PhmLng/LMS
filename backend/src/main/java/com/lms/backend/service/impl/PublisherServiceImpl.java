package com.lms.backend.service.impl;

import com.lms.backend.dto.publisherDto.PublisherRequest;
import com.lms.backend.dto.publisherDto.PublisherResponse;
import com.lms.backend.entity.Category;
import com.lms.backend.entity.Publisher;
import com.lms.backend.exception.AppExcpetion;
import com.lms.backend.exception.ErrorCode;
import com.lms.backend.mapper.PublisherMapper;
import com.lms.backend.repository.PublisherRepository;
import com.lms.backend.service.PublisherService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PublisherServiceImpl implements PublisherService {

    private final PublisherRepository publisherRepository;

    private final PublisherMapper publisherMapper;

    @Override
    public Page<PublisherResponse> getAllPublishers(Pageable pageable,String name) {
        Page<Publisher> publishers = publisherRepository.getAllPublishers(pageable,name);
        Page<PublisherResponse> publisherResponses = publishers.map(publisher -> publisherMapper.toPublisherResponse(publisher));
        return publisherResponses;
    }

    @Override
    public PublisherResponse getPublisherById(Long id) {
        Publisher publisher = publisherRepository.findById(id).orElseThrow(() -> new AppExcpetion(ErrorCode.PUBLISHER_NOT_FOUND));
        return publisherMapper.toPublisherResponse(publisher);
    }

    @Override
    public PublisherResponse createPublisher(PublisherRequest publisherRequest) {
        Publisher publisher = publisherMapper.toPublisher(publisherRequest);
        publisherRepository.save(publisher);
        return publisherMapper.toPublisherResponse(publisher);
    }

    @Override
    public PublisherResponse updatePublisher(Long id, PublisherRequest publisherRequest) {
        Publisher publisher = publisherRepository.findById(id).orElseThrow(() -> new AppExcpetion(ErrorCode.PUBLISHER_NOT_FOUND));
        publisherMapper.updatePublisher(publisher,publisherRequest);
        return publisherMapper.toPublisherResponse(publisher);
    }
}

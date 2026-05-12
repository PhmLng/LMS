package com.lms.backend.mapper;

import com.lms.backend.dto.authorDto.AuthorResponse;
import com.lms.backend.dto.publisherDto.PublisherRequest;
import com.lms.backend.dto.publisherDto.PublisherResponse;
import com.lms.backend.entity.Author;
import com.lms.backend.entity.Publisher;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PublisherMapper {
    PublisherResponse toPublisherResponse(Publisher publisher);
    Publisher toPublisher(PublisherRequest publisherRequest);
    void updatePublisher(@MappingTarget Publisher publisher, PublisherRequest publisherRequest);
}

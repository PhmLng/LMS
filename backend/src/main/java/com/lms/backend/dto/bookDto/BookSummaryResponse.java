package com.lms.backend.dto.bookDto;

import com.lms.backend.dto.authorDto.AuthorResponse;
import com.lms.backend.dto.publisherDto.PublisherResponse;
import lombok.Data;

@Data
public class BookSummaryResponse {
    private String title;
    private AuthorResponse author;
    private PublisherResponse publisher;
    private String imageUrl;
}

package com.lms.backend.dto.publisherDto;

import com.lms.backend.entity.Book;
import lombok.Data;


import java.util.List;

@Data
public class PublisherResponse {
    private Long id;
    private String name;
    private String description;
}

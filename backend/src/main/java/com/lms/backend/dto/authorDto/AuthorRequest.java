package com.lms.backend.dto.authorDto;
import com.lms.backend.entity.Book;
import lombok.Data;


import java.util.List;

@Data
public class AuthorRequest {
    private String name;
    private String description;
}

package com.lms.backend.service;

import com.lms.backend.dto.authorDto.AuthorRequest;
import com.lms.backend.dto.authorDto.AuthorResponse;
import com.lms.backend.dto.categoryDto.CategoryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AuthorService {
    public Page<AuthorResponse> getAllAuthors(Pageable pageable,String name);
    public AuthorResponse getAuthorById(Long id);
    public AuthorResponse createAuthor(AuthorRequest authorRequest);
    public AuthorResponse updateAuthor(Long id,AuthorRequest authorRequest);
}

package com.lms.backend.service.impl;

import com.lms.backend.dto.authorDto.AuthorRequest;
import com.lms.backend.dto.authorDto.AuthorResponse;
import com.lms.backend.dto.bookDto.BookResponse;
import com.lms.backend.dto.categoryDto.CategoryResponse;
import com.lms.backend.entity.Author;
import com.lms.backend.entity.Book;
import com.lms.backend.mapper.AuthorMapper;
import com.lms.backend.repository.AuthorRepository;
import com.lms.backend.service.AuthorService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthorResopnseImpl implements AuthorService {
    private final AuthorRepository authorRepository;

    private final AuthorMapper authorMapper;

    @Override
    public Page<AuthorResponse> getAllAuthors(Pageable pageable) {
        Page<Author> authors = authorRepository.findAll(pageable);
        Page<AuthorResponse> authorResponses = authors.map((author -> authorMapper.toAuthorResponse(author)));
        return authorResponses;
    }

    @Override
    public AuthorResponse getAuthorById(Long id) {
        Author author = authorRepository.findById(id).orElseThrow(()-> new RuntimeException("Author not found"));
        return authorMapper.toAuthorResponse(author);
    }

    @Override
    public AuthorResponse createAuthor(AuthorRequest authorRequest) {
        Author author = authorMapper.toAuthor(authorRequest);
        authorRepository.save(author);
        return authorMapper.toAuthorResponse(author);
    }

    @Override
    public AuthorResponse updateAuthor(Long id, AuthorRequest authorRequest) {
        Author author = authorRepository.findById(id).orElseThrow(()-> new RuntimeException("Author not found"));
        authorMapper.updateAuthor(author, authorRequest);
        authorRepository.save(author);
        return authorMapper.toAuthorResponse(author);
    }
}

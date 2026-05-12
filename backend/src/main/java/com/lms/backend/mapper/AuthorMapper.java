package com.lms.backend.mapper;

import com.lms.backend.dto.authorDto.AuthorRequest;
import com.lms.backend.dto.authorDto.AuthorResponse;
import com.lms.backend.entity.Author;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface AuthorMapper {
    AuthorResponse toAuthorResponse(Author author);
    Author toAuthor(AuthorRequest authorRequest);
    void updateAuthor(@MappingTarget Author author, AuthorRequest authorRequest);
}

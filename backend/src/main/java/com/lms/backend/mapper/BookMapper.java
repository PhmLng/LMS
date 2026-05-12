package com.lms.backend.mapper;

import com.lms.backend.dto.bookDto.*;
import com.lms.backend.entity.Book;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", uses = {AuthorMapper.class,CategoryMapper.class,PublisherMapper.class})
public interface BookMapper {
    BookDetailResponse toBookDetailResponse(Book book);

    @Mapping(source = "author.name", target = "author")
    @Mapping(source = "publisher.name",target = "publisher")
    BookResponse toBookResponse(Book book);

    @Mapping(target = "author", ignore = true)
    @Mapping(target = "publisher", ignore = true)
    @Mapping(target = "categories", ignore = true)
    Book toBook (BookRequest bookRequest);


    @Mapping(target = "author", ignore = true)
    @Mapping(target = "publisher", ignore = true)
    @Mapping(target = "categories", ignore = true)
    void updateBook(@MappingTarget Book book, BookRequest bookRequest);

    BookSummaryResponse toBookSummaryResponse(Book book);

    BookMinimalResponse toBookMinimalResponse(Book book);

}

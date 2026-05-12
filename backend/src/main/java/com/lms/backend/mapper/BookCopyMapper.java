package com.lms.backend.mapper;

import com.lms.backend.dto.BookCopyDto.BookCopyDetailResponse;
import com.lms.backend.dto.BookCopyDto.BookCopyRequest;
import com.lms.backend.dto.BookCopyDto.BookCopyResponse;
import com.lms.backend.dto.BookCopyDto.BookCopyUpdateRequest;
import com.lms.backend.dto.locationDto.LocationRequest;
import com.lms.backend.dto.locationDto.LocationResponse;
import com.lms.backend.entity.BookCopy;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

@Mapper(componentModel = "spring", uses = {BookMapper.class})
public interface BookCopyMapper {

    @Mapping(source = "location", target = "location", qualifiedByName = "stringToLocationResponse")
    @Mapping(source = "book", target = "bookSummary")
    BookCopyDetailResponse toBookCopyDetailResponse(BookCopy bookCopy);

    @Mapping(source = "location", target = "location", qualifiedByName = "stringToLocationResponse")
    @Mapping(source = "book.title", target = "title")
    @Mapping(source = "book.id",target = "bookId")
    BookCopyResponse toBookCopyResponse(BookCopy bookCopy);

    @Mapping(target = "book", ignore = true)
    @Mapping(source = "location", target = "location", qualifiedByName = "locationRequestToString")
    BookCopy toBookCopy(BookCopyRequest bookCopyRequest);

    @Mapping(source = "location", target = "location", qualifiedByName = "locationRequestToString")
    void updateBookCopy(@MappingTarget BookCopy bookCopy, BookCopyUpdateRequest updateRequest);

    @Named("locationRequestToString")
    default String mapLocationToString(LocationRequest locationRequest) {
        if (locationRequest == null) return null;
        return locationRequest.toRawString();
    }

    @Named("stringToLocationResponse")
    default LocationResponse mapLocationToResponse(String locationStr) {
        if (locationStr == null || !locationStr.contains("-")) {
            return new LocationResponse(locationStr, "N/A", "N/A", "N/A");
        }
        String[] parts = locationStr.split("-");
        return new LocationResponse(locationStr, parts[0], parts[1], parts[2]);
    }


}

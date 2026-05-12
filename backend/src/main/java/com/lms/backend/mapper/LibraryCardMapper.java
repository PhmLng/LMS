package com.lms.backend.mapper;

import com.lms.backend.dto.libraryCard.LibraryCardRequest;
import com.lms.backend.dto.libraryCard.LibraryCardResponse;
import com.lms.backend.dto.libraryCard.LibraryCardUpdateRequest;
import com.lms.backend.entity.LibraryCard;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface LibraryCardMapper {
    @Mapping(source = "reader.fullName", target = "readerName")
    LibraryCardResponse toLibraryCardResponse(LibraryCard libraryCard);

    @Mapping(target = "reader",ignore = true)
    @Mapping(target = "cardCode", ignore = true)
    LibraryCard toLibraryCard(LibraryCardRequest libraryCardRequest);

    void updateLibraryCard(@MappingTarget LibraryCard libraryCard, LibraryCardUpdateRequest libraryCardUpdateRequest);
}

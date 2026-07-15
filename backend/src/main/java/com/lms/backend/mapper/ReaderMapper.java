package com.lms.backend.mapper;

import com.lms.backend.dto.readerDto.ReaderRequest;
import com.lms.backend.dto.readerDto.ReaderDetailResponse;
import com.lms.backend.dto.readerDto.ReaderResponse;
import com.lms.backend.dto.readerDto.ReaderUpdateRequest;
import com.lms.backend.entity.Reader;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring",uses = {AccountMapper.class,LibraryCardMapper.class})
public interface ReaderMapper {
    @Mapping(source = "account", target = "accountResponse")
    @Mapping(source = "libraryCard", target = "libraryCardResponse")
    ReaderDetailResponse toReaderDetailResponse(Reader reader);

    @Mapping(target = "libraryCard", ignore = true)
    @Mapping(target = "account", ignore = true)
    Reader toReader(ReaderRequest readerRequest);

    @Mapping(source = "libraryCard.cardCode",target = "cardCode")
    @Mapping(source = "libraryCard.status",target = "cardStatus")
    @Mapping(source = "libraryCard.expiryDate",target = "expiryDate")
    ReaderResponse toReaderResponse(Reader reader);

    void updateReader(@MappingTarget Reader reader , ReaderRequest readerRequest);
}

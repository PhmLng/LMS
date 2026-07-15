package com.lms.backend.mapper;

import com.lms.backend.dto.fineDto.FineResponse;
import com.lms.backend.entity.Fine;
import com.lms.backend.enums.FineStatus;
import com.lms.backend.repository.FineRepository;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FineMapper {
    @Mapping(source = "loanDetail.bookCopy.book.title", target = "bookTitle")
    @Mapping(target = "cardCode", ignore = true)
    @Mapping(target = "readerName", ignore = true)
    FineResponse toFineResponse (Fine fine);
}

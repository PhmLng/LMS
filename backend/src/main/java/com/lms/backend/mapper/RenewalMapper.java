package com.lms.backend.mapper;

import com.lms.backend.dto.renewalDto.RenewalResponse;
import com.lms.backend.entity.Renewal;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RenewalMapper {
    @Mapping(source = "loanDetail.bookCopy.book.title", target = "bookTitle")
    RenewalResponse toRenewalResponse(Renewal renewal);
}

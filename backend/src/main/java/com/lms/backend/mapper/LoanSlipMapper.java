package com.lms.backend.mapper;

import com.lms.backend.dto.loanSlipDto.LoanSlipResponse;
import com.lms.backend.entity.LoanSlip;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring",uses = LoanDetailMapper.class)
public interface LoanSlipMapper {
    @Mapping(source = "libraryCard.id", target = "libraryCardId")
    @Mapping(source = "libraryCard.cardCode", target = "libraryCardCode")
    @Mapping(source = "details", target = "loanDetailResponses")
    @Mapping(source ="libraryCard.reader.fullName",target = "readerName")
    LoanSlipResponse toLoanSlipResponse(LoanSlip loanSlip);
}

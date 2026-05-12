package com.lms.backend.mapper;

import com.lms.backend.dto.LoanDetailDto.LoanDetailResponse;
import com.lms.backend.dto.LoanDetailDto.ReturnItemRepsonse;
import com.lms.backend.entity.LoanDetail;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface LoanDetailMapper {
    @Mapping(source = "bookCopy.book", target = "bookMinimalResponse")
    @Mapping(source = "bookCopy.barcode", target = "barcode")
    LoanDetailResponse toLoanDetailResponse(LoanDetail loanDetail);
    List<LoanDetailResponse> toLoanDetailResponseList(List<LoanDetail> loanDetailList);

    ReturnItemRepsonse toReturnItemRepsonse(LoanDetail loanDetail);
}

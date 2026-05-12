package com.lms.backend.dto.LoanDetailDto;

import lombok.Data;

import java.util.List;

@Data
public class ReturnRequest {
    private List<ReturnItemDetailRequest> returnItemDetailRequests;
}

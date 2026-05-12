package com.lms.backend.service;

import com.lms.backend.dto.fineDto.FineResponse;
import com.lms.backend.enums.FineStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface FineService {
    public Page<FineResponse> getFineByStatus (Long ReaderId,FineStatus status, Pageable pageable);
}

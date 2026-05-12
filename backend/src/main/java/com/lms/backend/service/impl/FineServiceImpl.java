package com.lms.backend.service.impl;

import com.lms.backend.dto.fineDto.FineResponse;
import com.lms.backend.entity.Fine;
import com.lms.backend.enums.FineStatus;
import com.lms.backend.mapper.FineMapper;
import com.lms.backend.repository.FineRepository;
import com.lms.backend.service.FineService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FineServiceImpl implements FineService {

    private final FineRepository fineRepository;
    private final FineMapper fineMapper;

    @Override
    public Page<FineResponse> getFineByStatus(Long readerId,FineStatus status, Pageable pageable) {
        Page<Fine> fines = fineRepository.getFineByReaderIdAndStatus(readerId,status, pageable);
        Page<FineResponse> fineResponses = fines.map(fine -> fineMapper.toFineResponse(fine));
        return fineResponses;
    }
}

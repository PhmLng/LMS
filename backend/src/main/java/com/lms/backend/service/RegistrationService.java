package com.lms.backend.service;

import com.lms.backend.dto.readerDto.ReaderDetailResponse;
import com.lms.backend.dto.readerDto.ReaderRegistrationRequest;
import com.lms.backend.dto.staffDto.StaffRegistrationRequest;
import com.lms.backend.dto.staffDto.StaffResponse;

public interface RegistrationService {
    public ReaderDetailResponse registerNewReader(ReaderRegistrationRequest readerRequest);
    public StaffResponse registerNewStaff(StaffRegistrationRequest staffRegistrationRequest);
}

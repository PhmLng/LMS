package com.lms.backend.service.impl;

import com.lms.backend.dto.readerDto.ReaderRegistrationRequest;
import com.lms.backend.dto.readerDto.ReaderDetailResponse;
import com.lms.backend.dto.staffDto.StaffRegistrationRequest;
import com.lms.backend.dto.staffDto.StaffResponse;
import com.lms.backend.entity.Account;
import com.lms.backend.entity.LibraryCard;
import com.lms.backend.entity.Reader;
import com.lms.backend.entity.Staff;
import com.lms.backend.mapper.ReaderMapper;
import com.lms.backend.mapper.StaffMapper;
import com.lms.backend.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RegistrationServiceImpl implements RegistrationService {
    private final ReaderService readerService;
    private final ReaderMapper readerMapper;
    private final LibraryCardService libraryCardService;
    private final AccountService accountService;
    private final StaffService staffService;
    private final StaffMapper staffMapper;
    @Override
    @Transactional(rollbackFor = Exception.class)
    public ReaderDetailResponse registerNewReader(ReaderRegistrationRequest readerRegistrationRequest) {

        Account account = accountService.CreateAccount(readerRegistrationRequest.getAccountRequest());


        LibraryCard libraryCard = libraryCardService.createLibraryCard(readerRegistrationRequest.getLibraryCardRequest());
        Reader reader = readerService.createReader(readerRegistrationRequest.getReaderRequest(), account, libraryCard);

        return readerMapper.toReaderDetailResponse(reader);
    }

    /* Note: cần xem lại logic và các tham số truyền vào tại đây
    Lý do: Hiện tạo method này đang tạo ra 1 account bị null field fullname
    */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public StaffResponse registerNewStaff(StaffRegistrationRequest staffRegistrationRequest) {
        Account account = accountService.CreateAccount(staffRegistrationRequest.getAccountRequest());

        Staff staff = staffService.createStaff(staffRegistrationRequest.getStaffRequest(), account);

        return staffMapper.toStaffResponse(staff);
    }
}

package com.lms.backend.service.impl;

import com.lms.backend.dto.staffDto.StaffRequest;
import com.lms.backend.dto.staffDto.StaffResponse;
import com.lms.backend.dto.staffDto.StaffUpdateRequest;
import com.lms.backend.entity.Account;
import com.lms.backend.entity.Staff;
import com.lms.backend.enums.AccountStatus;
import com.lms.backend.exception.AppExcpetion;
import com.lms.backend.exception.ErrorCode;
import com.lms.backend.mapper.StaffMapper;
import com.lms.backend.repository.StaffRepository;
import com.lms.backend.service.StaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StaffServiceImpl implements StaffService {
    private final StaffRepository staffRepository;
    private final StaffMapper staffMapper;

    @Transactional(rollbackFor = Exception.class)
    @Override
    public Staff createStaff(StaffRequest staffRequest, Account account) {
        Staff staff = staffMapper.toStaff(staffRequest);
        staff.setAccount(account);
        staffRepository.save(staff);
        return staff;
    }

    @Override
    public Page<StaffResponse> getAllStaff(Pageable pageable, AccountStatus accountStatus, String roleName) {
        Page<Staff> staffPage = staffRepository.findAllStaffByCondition(pageable,accountStatus, roleName);
        return staffPage.map(staffMapper::toStaffResponse);
    }

    @Override
    public StaffResponse getStaffByName(String name) {
        Staff staff = staffRepository.findStaffByFullName(name);
        return staffMapper.toStaffResponse(staff);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void lockStaff(Long id) {
        Staff staff = staffRepository.findById(id).orElseThrow(()->new AppExcpetion(ErrorCode.STAFF_NOT_FOUND));
        Account account = staff.getAccount();
        account.setStatus(AccountStatus.INACTIVE);
        staffRepository.save(staff);
    }

    @Override
    public void unlockStaff(Long id) {
        Staff staff = staffRepository.findById(id).orElseThrow(()->new AppExcpetion(ErrorCode.STAFF_NOT_FOUND));
        Account account = staff.getAccount();
        account.setStatus(AccountStatus.ACTIVE);
        staffRepository.save(staff);
    }

    @Override
    public void updateStaff(StaffUpdateRequest staffUpdateRequest) {
    }
}

package com.lms.backend.service;

import com.lms.backend.dto.staffDto.StaffRequest;
import com.lms.backend.dto.staffDto.StaffResponse;
import com.lms.backend.dto.staffDto.StaffUpdateRequest;
import com.lms.backend.entity.Account;
import com.lms.backend.entity.Staff;
import com.lms.backend.enums.AccountStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface StaffService {
    public Staff createStaff(StaffRequest staffRequest, Account account);
    public Page<StaffResponse> getAllStaff(Pageable pageable, AccountStatus accountStatus, String roleName);
    public StaffResponse getStaffByName(String name);
    public void lockStaff(Long id);
    public void unlockStaff(Long id);
    public void updateStaff(StaffUpdateRequest staffUpdateRequest);
}

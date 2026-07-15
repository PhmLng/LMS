package com.lms.backend.dto.staffDto;

import com.lms.backend.dto.accountDto.AccountRequest;
import lombok.Data;

@Data
public class StaffRegistrationRequest {
    private AccountRequest accountRequest;
    private StaffRequest staffRequest;
}

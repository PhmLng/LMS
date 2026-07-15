package com.lms.backend.dto.staffDto;

import com.lms.backend.enums.AccountStatus;
import lombok.Data;

import java.util.List;

@Data
public class StaffResponse {
    private Long id;
    private String fullName;
    private String email;
    private AccountStatus status;
    private List<String> roles;
    private String phoneNumber;
}

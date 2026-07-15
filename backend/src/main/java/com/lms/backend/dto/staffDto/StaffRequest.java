package com.lms.backend.dto.staffDto;

import lombok.Data;

@Data
public class StaffRequest {
    private String fullName;
    private String email;
    private String phoneNumber;
}

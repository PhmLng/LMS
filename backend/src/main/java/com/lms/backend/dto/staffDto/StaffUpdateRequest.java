package com.lms.backend.dto.staffDto;

import lombok.Data;

import java.util.List;

@Data
public class StaffUpdateRequest {
    private String fullName;
    private String email;
    private String phoneNumber;
    private List<String> roles;
}

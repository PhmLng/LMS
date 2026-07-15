package com.lms.backend.dto.authDto;

import lombok.Data;

@Data
public class AuthRequest {
    private String username;
    private String password;
}

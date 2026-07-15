package com.lms.backend.dto.authDto;

import lombok.Data;

@Data
public class RefreshTokenRequest {
    private String token;
}

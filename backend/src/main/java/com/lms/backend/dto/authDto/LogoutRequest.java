package com.lms.backend.dto.authDto;

import lombok.Data;

@Data
public class LogoutRequest {
    String accessToken;
    String refreshToken;
}

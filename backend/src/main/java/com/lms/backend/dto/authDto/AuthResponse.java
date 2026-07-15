package com.lms.backend.dto.authDto;

import com.lms.backend.dto.accountDto.AccountInfor;
import com.lms.backend.dto.accountDto.AccountResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private AccountInfor accountInfor;
}

package com.lms.backend.service;

import com.lms.backend.dto.authDto.*;
import com.nimbusds.jose.JOSEException;

import java.text.ParseException;

public interface AuthService {
    public AuthResponse login(AuthRequest authRequest);
    public void register(AuthRequest authRequest);
    public void logout(LogoutRequest logoutRequest) throws ParseException, JOSEException;
    public RefreshTokenResponse refreshToken(RefreshTokenRequest refreshTokenRequest);
}

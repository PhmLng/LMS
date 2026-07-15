package com.lms.backend.service.impl;

import com.lms.backend.dto.authDto.*;
import com.lms.backend.entity.Account;
import com.lms.backend.entity.InvalidatedToken;
import com.lms.backend.entity.RefreshToken;
import com.lms.backend.entity.Staff;
import com.lms.backend.mapper.AccountMapper;
import com.lms.backend.repository.*;
import com.lms.backend.security.JwtService;
import com.lms.backend.service.AuthService;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.ParseException;
import java.time.Instant;
import java.util.Date;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenRepository refreshTokenRepository;
    private final InvalidatedTokenRepository invalidatedTokenRepository;
    private final AccountMapper accountMapper;
    private final JwtService jwtService;


    @Override
    public AuthResponse login(AuthRequest authRequest) {
        Account account = accountRepository.findByUsername(authRequest.getUsername()).orElseThrow(() -> new RuntimeException("Account not found"));

        if(!passwordEncoder.matches(authRequest.getPassword(), account.getPassword())) {
            throw new RuntimeException("Wrong password");
        }
        return AuthResponse.builder()
                .accessToken(jwtService.generateAccessToken(account))
                .refreshToken(jwtService.generateRefreshToken(account))
                .accountInfor(accountMapper.toAccountInfor(account))
                .build();
    }

    @Override
    public void register(AuthRequest authRequest) {

    }

    @Override
    public void logout(LogoutRequest logoutRequest) throws ParseException, JOSEException {
        SignedJWT signedJWT = jwtService.verifyAccessToken(logoutRequest.getAccessToken());

        if (signedJWT.getJWTClaimsSet().getExpirationTime().after(new Date())){
            InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                    .id(signedJWT.getJWTClaimsSet().getJWTID())
                    .expiryTime(signedJWT.getJWTClaimsSet().getExpirationTime())
                    .build();
            invalidatedTokenRepository.save(invalidatedToken);
        }

        RefreshToken refreshToken = refreshTokenRepository.findByToken(logoutRequest.getRefreshToken()).orElseThrow(() -> new RuntimeException("Refresh token not found"));
        if (refreshToken != null) {
            refreshTokenRepository.delete(refreshToken);
        }
    }

    @Override
    @Transactional(rollbackFor = RuntimeException.class)
    public RefreshTokenResponse refreshToken(RefreshTokenRequest refreshTokenRequest) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenRequest.getToken()).orElseThrow(() -> new RuntimeException("Refresh token not found"));

        if (!refreshToken.getExpiryTime().toInstant().isAfter(Instant.now())) {
            throw new RuntimeException("Refresh token expired");
        }

        String accessToken = jwtService.generateAccessToken(refreshToken.getAccount());
        String refreshTokenId = jwtService.generateRefreshToken(refreshToken.getAccount());
        refreshTokenRepository.delete(refreshToken);
        return RefreshTokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenId)
                .build();
    }
}

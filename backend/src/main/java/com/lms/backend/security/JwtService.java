package com.lms.backend.security;

import com.lms.backend.dto.authDto.AuthResponse;
import com.lms.backend.dto.authDto.RefreshTokenRequest;
import com.lms.backend.entity.Account;
import com.lms.backend.entity.RefreshToken;
import com.lms.backend.repository.InvalidatedTokenRepository;
import com.lms.backend.repository.RefreshTokenRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.StringJoiner;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JwtService {

    @Value("${jwt.signerKey}")
    private String SIGNER_KEY;

    @Value("${jwt.access.duration}")
    private Long ACCESS_DURATION;

    @Value("${jwt.refresh-duration}")
    private Long REFRESH_DURATION;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;
    @Autowired
    private InvalidatedTokenRepository invalidatedTokenRepository;

    public String generateAccessToken(Account account) {

        JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet =  new JWTClaimsSet.Builder()
                .jwtID(UUID.randomUUID().toString())
                .subject(account.getId().toString())
                .issuer("dev.com")
                .claim("username", account.getUsername())
                .claim("authorities", buildScope(account))
                .issueTime(new Date())
                .expirationTime(new Date(Instant.now().plus(ACCESS_DURATION, ChronoUnit.SECONDS).toEpochMilli()))
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(jwsHeader, payload);
        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY));
        } catch (JOSEException e) {
            throw new RuntimeException(e);
        }
        return jwsObject.serialize();
    }


    public String generateRefreshToken(Account account) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryTime(new Date(Instant.now().plus(REFRESH_DURATION, ChronoUnit.SECONDS).toEpochMilli()));
        refreshToken.setAccount(account);
        refreshTokenRepository.save(refreshToken);
        return refreshToken.getToken();
    }


    public SignedJWT verifyAccessToken(String token) throws JOSEException, ParseException {
        JWSVerifier jwsVerifier = new MACVerifier(SIGNER_KEY.getBytes());
        SignedJWT signedJWT = SignedJWT.parse(token);

        boolean valid = signedJWT.verify(jwsVerifier);
        if (!valid) {
            throw new JOSEException("Invalid token");
        }
        if (invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID())){
            throw new JOSEException("Invalid token");
        };
        return signedJWT;
    }

    public String buildScope(Account account) {
        StringJoiner stringJoiner = new StringJoiner(" ");
        if (!CollectionUtils.isEmpty(account.getRoles())) {
            account.getRoles().forEach(role -> {
                stringJoiner.add("ROLE_"+role.getName());
                role.getPermissions().forEach(permission -> {
                    stringJoiner.add(permission.getPermission());
                });
            });
        }
        return stringJoiner.toString();
    }
}

package com.pawnhop.backend.auth.config;

import io.jsonwebtoken.security.Keys;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.crypto.SecretKey;

@Configuration
public class JwtConfig {

    private final String secret ="mySuperSecretKeyForPawnHopSystemJwtAuthentication123456";

    @Bean
    public SecretKey jwtSecretKey(){

        return Keys.hmacShaKeyFor(secret.getBytes());
    }
}

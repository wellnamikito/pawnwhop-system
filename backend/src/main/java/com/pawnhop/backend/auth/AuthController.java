package com.pawnhop.backend.auth;

import com.pawnhop.backend.auth.dto.AuthResponse;
import com.pawnhop.backend.auth.dto.LoginRequest;
import com.pawnhop.backend.auth.dto.UserInfoResponse;
import com.pawnhop.backend.auth.service.JwtService;
import com.pawnhop.backend.auth.service.PostgreSQLAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtService jwtService;

    private final PostgreSQLAuthService authService;

    @PostMapping("/login")
    public AuthResponse login(
            @RequestBody LoginRequest request
            ){
        String role = authService.authenticate(
                request.getUsername(),
                request.getPassword()
        );

        String token = jwtService.generateToken(
                request.getUsername(),
                role
        );

        return new AuthResponse(
                request.getUsername(),
                role,
                token
        );
    }

    @GetMapping("/me")
    public UserInfoResponse me(
            Authentication authentication
    ){
        String username = authentication.getName();

        String role = authentication
                .getAuthorities()
                .iterator()
                .next()
                .getAuthority();

        return new UserInfoResponse(username, role);
    }
}

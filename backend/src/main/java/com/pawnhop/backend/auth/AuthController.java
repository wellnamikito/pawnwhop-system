package com.pawnhop.backend.auth;

import com.pawnhop.backend.auth.dto.AuthResponse;
import com.pawnhop.backend.auth.dto.LoginRequest;
import com.pawnhop.backend.auth.service.PostgreSQLAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final PostgreSQLAuthService authService;

    @PostMapping("/login")
    public AuthResponse login(
            @RequestBody LoginRequest request
            ){
        String role = authService.authenticate(
                request.getUsername(),
                request.getPassword()
        );

        return new AuthResponse(
                request.getUsername(),
                role
        );
    }
}

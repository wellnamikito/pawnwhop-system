package com.pawnhop.backend.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class UserInfoResponse {

    private String username;

    private String role;
}

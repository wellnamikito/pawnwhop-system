package com.pawnhop.backend.dto.response;


import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@AllArgsConstructor
@Getter
@Setter
public class ClientResponseDto {

    private Integer clientId;

    private String lastname;

    private String firstname;

    private String middename;

    private LocalDate birthDate;

    private String socialStatus;

    private String phone;
}

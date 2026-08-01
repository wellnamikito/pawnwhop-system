package com.pawnhop.backend.dto.response;



import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@AllArgsConstructor
@Getter
@Setter
public class ClientResponseDto {

    private Integer clientId;

    private String lastName;

    private String firstName;

    private String middleName;

    private LocalDate birthDate;

    private String socialStatus;

    private String address;

    private String phone;
}

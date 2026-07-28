package com.pawnhop.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class OwnerResponseDto {

    private Integer id;

    private String lastName;

    private String firstName;

    private String middleName;

    private String ownerType;

    private String phone;
}

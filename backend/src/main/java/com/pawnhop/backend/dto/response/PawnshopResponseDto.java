package com.pawnhop.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class PawnshopResponseDto {

    private Integer id;

    private String name;

    private String ownershipType;

    private String owner;

    private String district;

    private String address;

    private String phone;

    private Integer openingHour;

    private Integer closingHour;
}

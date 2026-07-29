package com.pawnhop.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class PawnshopRequestDto {

    @NotBlank
    @Size(max = 100)
    private String name;

    @NotNull
    private Integer ownershipTypeId;

    @NotNull
    private Integer ownerId;

    @NotNull
    private Integer districtId;

    @NotBlank
    @Size(max = 100)
    private String address;

    @Size(max = 12)
    private String phone;

    @Min(0)
    @Max(23)
    private Integer openingHour;

    @Min(0)
    @Max(23)
    private Integer closingHour;
}

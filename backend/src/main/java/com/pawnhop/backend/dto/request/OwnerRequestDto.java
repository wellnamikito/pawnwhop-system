package com.pawnhop.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OwnerRequestDto {

    @NotNull
    @Size(max = 100)
    private String lastName;

    @NotNull
    @Size(max = 100)
    private String firstName;

    private String middleName;

    @NotNull
    private Integer ownerTypeId;

    @NotBlank
    @Size(max = 12)
    private String phone;
}

package com.pawnhop.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@AllArgsConstructor
@Getter
@Setter
public class ClientRequestDto {

    @NotNull
    @Size(max = 100)
    private String lastName;

    @NotNull
    @Size(max = 100)
    private String firstName;

    private String middleName;

    private LocalDate birthDay;

    @NotNull
    private Integer socialStatusId;

    @NotBlank
    @Size(max = 12)
    private String phone;
}

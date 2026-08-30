package com.pawnhop.backend.report.dto;

import java.time.LocalDate;


public record ClientEditViewDto(
        Integer clientId,
        String lastName,
        String firstName,
        String middleName,
        LocalDate birthDate,
        String address,
        String phone
) {
}

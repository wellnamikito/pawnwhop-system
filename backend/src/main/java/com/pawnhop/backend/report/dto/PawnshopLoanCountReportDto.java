package com.pawnhop.backend.report.dto;


public record PawnshopLoanCountReportDto(
        Integer clientId,
        String name,
        String fistName,
        Long loanCount
) {}

package com.pawnhop.backend.report.dto;


public record ClientMultipleLoansReportDto(
        Integer clientId,
        String lastName,
        String firstName,
        Long loanCount
){}

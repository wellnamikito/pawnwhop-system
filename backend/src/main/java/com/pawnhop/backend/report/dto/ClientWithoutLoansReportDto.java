package com.pawnhop.backend.report.dto;




public record ClientWithoutLoansReportDto(
        Integer clientId,
        String lastName,
        String firstName
){}

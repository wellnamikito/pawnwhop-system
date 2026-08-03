package com.pawnhop.backend.report.dto;



import java.math.BigDecimal;


public record PawnshopAverageLoanReportDto(
        String name,
        Long loanCount,
        BigDecimal avgAmount
) {}

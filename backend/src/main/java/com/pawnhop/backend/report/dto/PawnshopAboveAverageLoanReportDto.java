package com.pawnhop.backend.report.dto;



import java.math.BigDecimal;


public record PawnshopAboveAverageLoanReportDto(
        String name,
        BigDecimal avgAmount
) {}

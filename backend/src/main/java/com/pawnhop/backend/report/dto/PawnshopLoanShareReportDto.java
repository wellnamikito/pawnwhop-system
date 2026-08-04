package com.pawnhop.backend.report.dto;



import java.math.BigDecimal;


public record PawnshopLoanShareReportDto(
        Integer pawnshopId,
        String name,
        BigDecimal pawnshopTotal,
        BigDecimal percentOfTotal
) {}

package com.pawnhop.backend.report.dto;



import java.math.BigDecimal;


public record PawnshopLoanShareReportDto(

        String name,
        BigDecimal pawnshopTotal,
        BigDecimal percentOfTotal
) {}

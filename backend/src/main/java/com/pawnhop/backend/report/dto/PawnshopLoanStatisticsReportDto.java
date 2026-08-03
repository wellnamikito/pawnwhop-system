package com.pawnhop.backend.report.dto;



import java.math.BigDecimal;


public record PawnshopLoanStatisticsReportDto(

        String name,
        Long loanCount,
        BigDecimal totalAmount
) { }

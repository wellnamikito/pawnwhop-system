package com.pawnhop.backend.report.dto;



import java.math.BigDecimal;


public record ClientLoanStatisticsReportDto(
        Integer clientId,
        String lastName,
        Long loanCount,
        BigDecimal totalAmount
){}

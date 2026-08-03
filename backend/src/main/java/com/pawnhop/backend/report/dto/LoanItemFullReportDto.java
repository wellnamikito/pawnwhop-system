package com.pawnhop.backend.report.dto;



import java.math.BigDecimal;

public record LoanItemFullReportDto(
        Integer loanId,
        String lastName,
        String typeName,
        String itemDescription,
        BigDecimal itemValue
) {}

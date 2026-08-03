package com.pawnhop.backend.report.dto;



import java.math.BigDecimal;


public record LoanItemsByTypeReportDto(
        Integer loanId,
        String itemDescription,
        BigDecimal itemValue,
        String typeName
) {}

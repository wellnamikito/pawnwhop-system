package com.pawnhop.backend.report.dto;



import java.math.BigDecimal;


public record ClientWithLoansReportDto(
        String lastName,
        String firstName,
        Integer loanId,
        BigDecimal amount
) {}

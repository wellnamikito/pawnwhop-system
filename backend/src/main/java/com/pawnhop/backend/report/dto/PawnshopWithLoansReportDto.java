package com.pawnhop.backend.report.dto;



import java.math.BigDecimal;
import java.time.LocalDate;


public record PawnshopWithLoansReportDto(

        String name,
        Integer loanId,
        BigDecimal amount,
        LocalDate issueDate
) {}

package com.pawnhop.backend.report.dto;



import java.math.BigDecimal;
import java.time.LocalDate;


public record LoansByPawnshopReportDto(
        Integer loanId,
        String lastName,
        BigDecimal amount,
        LocalDate issueDate
){}

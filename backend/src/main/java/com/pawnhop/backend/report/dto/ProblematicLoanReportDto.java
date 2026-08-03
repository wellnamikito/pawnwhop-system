package com.pawnhop.backend.report.dto;


import java.math.BigDecimal;
import java.time.LocalDate;

public record ProblematicLoanReportDto(

        Long loanId,
        String lastName,
        String phone,
        BigDecimal amount,
        LocalDate returnDate,
        String reason
) {}

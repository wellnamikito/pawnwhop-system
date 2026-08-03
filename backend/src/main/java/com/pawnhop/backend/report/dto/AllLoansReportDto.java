package com.pawnhop.backend.report.dto;



import java.math.BigDecimal;
import java.time.LocalDate;


public record AllLoansReportDto(
        String pawnshop,

        String clientFio,

        BigDecimal amount,

        LocalDate issueDate,

        LocalDate returnDate,

        Boolean returned
){}

package com.pawnhop.backend.report.dto;



import java.time.LocalDate;


public record OverdueLoanReportDto(
        Integer loanId,

        String lastName,

        String phone,

        LocalDate returnDate
) {}

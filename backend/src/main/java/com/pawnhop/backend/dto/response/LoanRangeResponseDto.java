package com.pawnhop.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@AllArgsConstructor
@Getter
@Setter
public class LoanRangeResponseDto {

    private Integer loanId;

    private Integer pawnshopId;

    private Integer clientId;

    private BigDecimal amount;

    private LocalDate issueDate;

    private LocalDate returnDate;

    private BigDecimal penaltyPercent;

    private Boolean isReturned;

    /**
     * Реальная физическая секция PostgreSQL,
     * в которой находится запись.
     *
     * Например:
     * loan_range_y2023_q3
     * loan_range_y2024
     * loan_range_default
     */
    private String partition;
}
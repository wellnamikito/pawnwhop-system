package com.pawnhop.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@AllArgsConstructor
@Getter
@Setter
public class LoanListResponseDto {

    private Integer loanId;

    private Integer pawnshopId;

    private Integer clientId;

    private BigDecimal amount;

    private LocalDate issueDate;

    private LocalDate returnDate;

    private BigDecimal penaltyPercent;

    private Boolean isReturned;

    /**
     * Логическая группа ломбарда:
     *
     * 1
     * 2
     * 3
     * 4
     * 99 — DEFAULT
     */
    private Integer pawnshopGroup;

    /**
     * Реальная физическая секция PostgreSQL.
     *
     * Например:
     * loan_list_g1
     * loan_list_g2
     * loan_list_default
     */
    private String partition;
}
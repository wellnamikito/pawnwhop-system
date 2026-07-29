package com.pawnhop.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@AllArgsConstructor
@Getter
@Setter
public class LoanResponseDto {

    private Integer Loanid;

    private String pawnshop;

    private String client;

    private BigDecimal  amount;

    private LocalDate issueDate;

    private LocalDate returnDate;

    private BigDecimal penaltyPercent;

    private Boolean isReturned;
}

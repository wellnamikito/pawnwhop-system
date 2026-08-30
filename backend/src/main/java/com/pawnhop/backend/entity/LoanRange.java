package com.pawnhop.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "loan_range")
@Getter
@Setter
@NoArgsConstructor
public class LoanRange {

    @EmbeddedId
    private LoanRangeId id;

    @Column(name = "pawnshop_id", nullable = false)
    private Integer pawnshopId;

    @Column(name = "client_id", nullable = false)
    private Integer clientId;

    @Column(name = "amount")
    private BigDecimal amount;

    @Column(name = "return_date")
    private LocalDate returnDate;

    @Column(name = "penalty_percent")
    private BigDecimal penaltyPercent;

    @Column(name = "is_returned")
    private Boolean isReturned;
}
package com.pawnhop.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "loan")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "loan_id")
    private Integer loanId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pawnshop_id")
    private Pawnshop pawnshop;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private Client client;

    // amount_domain: NUMERIC(10,2), > 0
    @DecimalMin(value = "0.0", inclusive = false)
    @Digits(integer = 0, fraction = 2)
    @Column(name = "amount", precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "issue_date")
    private LocalDate issueDate;

    // CHECK (penalty_percent BETWEEN 0 AND 100)
    @DecimalMin(value = "0.0")
    @DecimalMax(value = "100.0")
    @Digits(integer = 3, fraction = 2)
    @Column(name = "penalty_percent", precision = 5, scale = 2)
    private BigDecimal penltyPercent;

    // damand_domain -> BOOLEAN
    @Column(name = "is_returned")
    private Boolean isReturned;
}

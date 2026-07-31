package com.pawnhop.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

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
    @JdbcTypeCode(SqlTypes.NUMERIC)
    @DecimalMin(value = "0.0", inclusive = false)
    @Digits(integer = 10, fraction = 2)
    @Column(name = "amount", columnDefinition = "amount_domain")
    private BigDecimal amount;

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Column(name = "return_date")
    private LocalDate returnDate;

    // CHECK (penalty_percent BETWEEN 0 AND 100)
    @DecimalMin(value = "0.0")
    @DecimalMax(value = "100.0")
    @Digits(integer = 3, fraction = 2)
    @Column(name = "penalty_percent", precision = 5, scale = 2)
    private BigDecimal penaltyPercent;

    // damand_domain -> BOOLEAN
    @JdbcTypeCode(SqlTypes.BOOLEAN)
    @Column(name = "is_returned", columnDefinition = "demand_domain")
    private Boolean isReturned;
}

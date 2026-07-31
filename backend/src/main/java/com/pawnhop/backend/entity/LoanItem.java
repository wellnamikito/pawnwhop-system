package com.pawnhop.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;

@Entity
@Table(name = "loan_item")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class LoanItem {

    @EmbeddedId
    private LoanItemId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("loanId")
    @JoinColumn(name = "loan_id")
    private Loan loan;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("itemTypeId")
    @JoinColumn(name = "item_type_id")
    private PledgeItemType itemType;

    @Column(name = "item_description", columnDefinition = "TEXT")
    private String itemDescription;

    // amount_domain: NUMERIC(10,2), > 0
    @JdbcTypeCode(SqlTypes.NUMERIC)
    @DecimalMin(value = "0.0", inclusive = false)
    @Digits(integer = 0, fraction = 2)
    @Column(name = "item_value", columnDefinition = "amount_domain")
    private BigDecimal itemValue;
}

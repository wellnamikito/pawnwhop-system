package com.pawnhop.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;

import java.math.BigDecimal;

@Entity
@Table(name = "loan_item")
public class LoanItem {

    @EmbeddedId
    private LoanItemId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("LoanId")
    @JoinColumn(name = "loan_id")
    private Loan loan;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("itemTypeId")
    @JoinColumn(name = "item_type_id")
    private PledgeItemType itemType;

    @Column(name = "item_description", columnDefinition = "TEXT")
    private String itemDescription;

    // amount_domain: NUMERIC(10,2), > 0
    @DecimalMin(value = "0.0", inclusive = false)
    @Digits(integer = 0, fraction = 2)
    @Column(name = "item_value", precision = 10, scale = 2)
    private BigDecimal itemValue;
}

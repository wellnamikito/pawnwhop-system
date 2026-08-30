package com.pawnhop.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class LoanListId implements Serializable {

    @Column(name = "loan_id")
    private Integer loanId;

    @Column(name = "pawnshop_group")
    private Integer pawnshopGroup;
}
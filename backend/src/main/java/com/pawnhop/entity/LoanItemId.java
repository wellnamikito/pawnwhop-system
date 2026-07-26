package com.pawnhop.entity;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class LoanItemId implements Serializable {

    private Integer loanId;

    private Integer itemTypeId;
}

package com.pawnhop.backend.dto.response;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@AllArgsConstructor
@Getter
@Setter
public class LoanItemResponseDto {

    private Integer loanId;

    private Integer itemTypeId;

    private String itemTypeName;

    private String itemDescription;

    private BigDecimal itemValue;
}

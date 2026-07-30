package com.pawnhop.backend.service;



import com.pawnhop.backend.dto.request.LoanItemRequestDto;
import com.pawnhop.backend.dto.response.LoanItemResponseDto;

import java.util.List;

public interface LoanItemService {

    List<LoanItemResponseDto> getAllLoanItems();

    LoanItemResponseDto getLoanItemById(Integer Loanid,
                                        Integer itemTypeId
    );

    LoanItemResponseDto createLoanItem(LoanItemRequestDto dto);

    LoanItemResponseDto updateLoanItem(Integer Loanid,
                                       Integer itemTypeId,
                                       LoanItemRequestDto dto
    );

    void deleteLoanItem(Integer Loanid, Integer itemTypeId);
}

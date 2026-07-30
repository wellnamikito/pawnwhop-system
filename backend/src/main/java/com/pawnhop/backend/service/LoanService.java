package com.pawnhop.backend.service;

import com.pawnhop.backend.dto.request.LoanRequestDto;
import com.pawnhop.backend.dto.response.LoanResponseDto;

import java.util.List;

public interface LoanService {

    List<LoanResponseDto> getAllLoans();

    LoanResponseDto getLoanById(Integer id);

    LoanResponseDto createLoan(LoanRequestDto dto);

    LoanResponseDto updateLoan(Integer id, LoanRequestDto dto);

    void deleteLoan(Integer id);
}

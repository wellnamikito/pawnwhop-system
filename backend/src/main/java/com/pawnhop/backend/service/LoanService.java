package com.pawnhop.backend.service;

import com.pawnhop.backend.dto.request.LoanRequestDto;
import com.pawnhop.backend.dto.response.LoanResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface LoanService {

    List<LoanResponseDto> getAllLoans();

    Page<LoanResponseDto> getLoansPage(Pageable pageable);

    LoanResponseDto createLoan(LoanRequestDto dto);

    LoanResponseDto updateLoan(Integer id, LoanRequestDto dto);

    void deleteLoan(Integer id);
}

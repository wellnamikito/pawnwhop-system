package com.pawnhop.backend.controller;


import com.pawnhop.backend.dto.request.LoanRequestDto;
import com.pawnhop.backend.dto.response.LoanResponseDto;
import com.pawnhop.backend.service.LoanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;

    // GET /api/loans
    @GetMapping
    public List<LoanResponseDto> getAllLoans(){

        return loanService.getAllLoans();
    }

    // GET /api/clients/{id}
    @GetMapping("/{id}")
    public LoanResponseDto getLoanById(
            @PathVariable Integer id
    ){

        return  loanService.getLoanById(id);
    }

    // POST /api/clients/{id}
    @PutMapping("/{id")
    public LoanResponseDto createClient(
            @Valid @RequestBody LoanRequestDto dto
    ){

        return loanService.createLoan(dto);
    }

    // PUT /api/loans/{id}
    @PutMapping("/{id}")
    public LoanResponseDto updateLoan(
            @PathVariable Integer id,
            @Valid @RequestBody LoanRequestDto dto
    ){

        return loanService.updateLoan(id, dto);
    }

    // DELETE /api/loans/{id}
    @DeleteMapping("/{id")
    public void deleteLoan(
            @PathVariable Integer id
    ){
        loanService.deleteLoan(id);
    }
}

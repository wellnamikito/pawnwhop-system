package com.pawnhop.backend.controller;


import com.pawnhop.backend.dto.request.LoanRequestDto;
import com.pawnhop.backend.dto.response.LoanResponseDto;
import com.pawnhop.backend.service.LoanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
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
    @GetMapping("/page")
    public Page<LoanResponseDto> getLoanById(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 50, sort = "loanId")
            Pageable pageable){

        return  loanService.getLoansPage(search,pageable);
    }

    // POST /api/loans/{id}
    @PostMapping
    public LoanResponseDto createLoan(
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
    @DeleteMapping("/{id}")
    public void deleteLoan(
            @PathVariable Integer id
    ){
        loanService.deleteLoan(id);
    }
}

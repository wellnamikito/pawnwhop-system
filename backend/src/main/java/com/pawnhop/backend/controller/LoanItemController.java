package com.pawnhop.backend.controller;

import com.pawnhop.backend.dto.request.LoanItemRequestDto;
import com.pawnhop.backend.dto.response.LoanItemResponseDto;
import com.pawnhop.backend.service.LoanItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loans/{loanId}/items")
@RequiredArgsConstructor
public class LoanItemController {

    private final LoanItemService loanItemService;

    // GET /api/loans/{loanId}/items
    @GetMapping
    public List<LoanItemResponseDto> getLoanItemsByLoanId(
            @PathVariable Integer loanId
    ) {
        return loanItemService.getLoanItemsByLoanId(loanId);
    }

    // GET /api/loans/{loanId}/items/{itemTypeId}
    @GetMapping("/{itemTypeId}")
    public LoanItemResponseDto getLoanItemById(
            @PathVariable Integer loanId,
            @PathVariable Integer itemTypeId
    ) {
        return loanItemService.getLoanItemById(loanId, itemTypeId);
    }

    // POST /api/loans/{loanId}/items
    @PostMapping
    public LoanItemResponseDto createLoanItem(
            @PathVariable Integer loanId,
            @Valid @RequestBody LoanItemRequestDto dto
    ) {

        // Если loanId уже есть в DTO, можно проверить совпадение:
        // if (!loanId.equals(dto.getLoanId())) {
        //     throw new IllegalArgumentException("loanId в URL и теле запроса не совпадают");
        // }

        return loanItemService.createLoanItem(dto);
    }

    // PUT /api/loans/{loanId}/items/{itemTypeId}
    @PutMapping("/{itemTypeId}")
    public LoanItemResponseDto updateLoanItem(
            @PathVariable Integer loanId,
            @PathVariable Integer itemTypeId,
            @Valid @RequestBody LoanItemRequestDto dto
    ) {

        return loanItemService.updateLoanItem(loanId, itemTypeId, dto);
    }

    // DELETE /api/loans/{loanId}/items/{itemTypeId}
    @DeleteMapping("/{itemTypeId}")
    public void deleteLoanItem(
            @PathVariable Integer loanId,
            @PathVariable Integer itemTypeId
    ) {

        loanItemService.deleteLoanItem(loanId, itemTypeId);
    }
}
package com.pawnhop.backend.service.impl;

import com.pawnhop.backend.dto.request.LoanItemRequestDto;
import com.pawnhop.backend.dto.response.LoanItemResponseDto;
import com.pawnhop.backend.entity.Loan;
import com.pawnhop.backend.entity.LoanItem;
import com.pawnhop.backend.entity.LoanItemId;
import com.pawnhop.backend.entity.PledgeItemType;
import com.pawnhop.backend.repository.LoanItemRepo;
import com.pawnhop.backend.repository.LoanRepo;
import com.pawnhop.backend.repository.PledgeItemTypeRepo;
import com.pawnhop.backend.service.LoanItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LoanItemServiceImpl implements LoanItemService {

    private final LoanItemRepo loanItemRepo;

    private final LoanRepo loanRepo;

    private final PledgeItemTypeRepo pledgeItemTypeRepo;

    @Override
    @Transactional(readOnly = true)
    public List<LoanItemResponseDto> getAllLoanItems(){

        return loanItemRepo.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public LoanItemResponseDto getLoanItemById(Integer LoanId,
                                        Integer itemTypeId
    ){
        LoanItemId loanItemId = new LoanItemId(LoanId, itemTypeId);
        LoanItem loanItem = loanItemRepo.findById(loanItemId)
                .orElseThrow(() ->
                    new RuntimeException("Предмет ссуды не найденн: " + LoanId + " " + itemTypeId)
                );

        return mapToResponse(loanItem);
    }

    @Override
    @Transactional
    public LoanItemResponseDto createLoanItem(LoanItemRequestDto dto){

        Loan loan = loanRepo
                .findById(dto.getLoanId())
                .orElseThrow(() ->
                    new RuntimeException("Ссуда не найдена")
                );

        PledgeItemType pledgeItemType = pledgeItemTypeRepo
                .findById(dto.getItemTypeId())
                .orElseThrow(() ->
                    new RuntimeException("Тип залога не найден")
                );

        LoanItem loanItem = new LoanItem();

        loanItem.setLoan(loan);
        loanItem.setItemType(pledgeItemType);
        loanItem.setItemDescription(dto.getItemDescription());
        loanItem.setItemValue(dto.getItemValue());

        LoanItem savedLoanItem = loanItemRepo.save(loanItem);

        return mapToResponse(savedLoanItem);
    }

    @Override
    @Transactional
    public LoanItemResponseDto updateLoanItem(Integer loanId,
                                       Integer itemTypeId,
                                       LoanItemRequestDto dto
    ){
        LoanItemId loanItemId = new LoanItemId(loanId, itemTypeId);
        LoanItem loanItem = loanItemRepo
                .findById(loanItemId)
                .orElseThrow(() ->
                    new RuntimeException("Предмет ссуды не найден")
                );

        Loan loan = loanRepo
                .findById(dto.getLoanId())
                .orElseThrow(() ->
                        new RuntimeException("Ссуда не найдена")
                );

        PledgeItemType pledgeItemType = pledgeItemTypeRepo
                .findById(dto.getItemTypeId())
                .orElseThrow(() ->
                        new RuntimeException("Тип залога не найден")
                );

        loanItem.setLoan(loan);
        loanItem.setItemType(pledgeItemType);
        loanItem.setItemDescription(dto.getItemDescription());
        loanItem.setItemValue(dto.getItemValue());

        return mapToResponse(loanItem);
    }

    @Override
    @Transactional
    public void deleteLoanItem(Integer loanid, Integer itemTypeId){

        LoanItemId loanItemId = new LoanItemId(loanid, itemTypeId);

        if(!loanItemRepo.existsById(loanItemId)){
            throw new RuntimeException("Предмет ссуды не найден");
        }

        loanItemRepo.deleteById(loanItemId);
    }

    private LoanItemResponseDto mapToResponse(LoanItem loanItem){

        return new LoanItemResponseDto(
                loanItem.getLoan().getLoanId(),

                loanItem.getItemType().getItemTypeId(),

                loanItem.getItemType().getTypeName(),

                loanItem.getItemDescription(),

                loanItem.getItemValue()
        );
    }
}

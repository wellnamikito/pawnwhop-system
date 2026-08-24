package com.pawnhop.backend.service.impl;

import com.pawnhop.backend.dto.request.LoanRequestDto;
import com.pawnhop.backend.dto.response.LoanResponseDto;
import com.pawnhop.backend.entity.Loan;
import com.pawnhop.backend.entity.Client;
import com.pawnhop.backend.entity.Pawnshop;
import com.pawnhop.backend.repository.ClientRepo;
import com.pawnhop.backend.repository.LoanRepo;
import com.pawnhop.backend.repository.PawnshopRepo;
import com.pawnhop.backend.service.LoanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LoanServiceImpl implements LoanService {

    private final LoanRepo loanRepo;

    private final ClientRepo clientRepo;

    private final PawnshopRepo pawnshopRepo;

    @Override
    @Transactional(readOnly = true)
    public List<LoanResponseDto> getAllLoans(){

        return loanRepo.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<LoanResponseDto> getLoansPage(Pageable pageable){

        return loanRepo.findAll(pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional
    public LoanResponseDto createLoan(LoanRequestDto dto){

        Client client = clientRepo
                .findById(dto.getClientId())
                .orElseThrow(() ->
                    new RuntimeException("Клиент не найден")
                );
        Pawnshop pawnshop = pawnshopRepo
                .findById(dto.getPawnshopId())
                .orElseThrow(() ->
                    new RuntimeException("Ломбард не найден")
                );

        Loan loan = new Loan();

        loan.setPawnshop(pawnshop);
        loan.setClient(client);
        loan.setAmount(dto.getAmount());
        loan.setIssueDate(dto.getIssueDate());
        loan.setReturnDate(dto.getReturnDate());
        loan.setPenaltyPercent(dto.getPenaltyPercent());
        loan.setIssueDate(dto.getIssueDate());

        Loan savedLoan = loanRepo.save(loan);

        return mapToResponse(savedLoan);
    }

    @Override
    @Transactional
    public LoanResponseDto updateLoan(Integer id,LoanRequestDto dto){

        Loan loan = loanRepo
                .findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Ссуда не найдена")
                );

        Client client = clientRepo
                .findById(dto.getClientId())
                .orElseThrow(() ->
                        new RuntimeException("Клиент не найден")
                );
        Pawnshop pawnshop = pawnshopRepo
                .findById(dto.getPawnshopId())
                .orElseThrow(() ->
                        new RuntimeException("Ломбард не найден")
                );

        loan.setPawnshop(pawnshop);
        loan.setClient(client);
        loan.setAmount(dto.getAmount());
        loan.setIssueDate(dto.getIssueDate());
        loan.setReturnDate(dto.getReturnDate());
        loan.setPenaltyPercent(dto.getPenaltyPercent());
        loan.setIssueDate(dto.getIssueDate());

        return mapToResponse(loan);
    }

    @Override
    @Transactional
    public void deleteLoan(Integer id){

        if(!loanRepo.existsById(id)){ throw new RuntimeException("Ссуда не найдена");}

        loanRepo.deleteById(id);
    }

    private LoanResponseDto mapToResponse(Loan loan){

        return new LoanResponseDto(
                loan.getLoanId(),

                loan.getPawnshop().getName(),

                loan.getClient().getLastName()
                + " " + loan.getClient().getFirstName()
                + " " + loan.getClient().getMiddleName(),

                loan.getAmount(),

                loan.getIssueDate(),

                loan.getReturnDate(),

                loan.getPenaltyPercent(),

                loan.getIsReturned()
        );
    }
}

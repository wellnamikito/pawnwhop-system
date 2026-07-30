package com.pawnhop.backend.repository;

import com.pawnhop.backend.entity.LoanItem;
import com.pawnhop.backend.entity.LoanItemId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanItemRepo extends JpaRepository<LoanItem, LoanItemId> {
    List<LoanItem> findByLoan_LoanId(Integer loanId);
}

package com.pawnhop.backend.repository;

import com.pawnhop.backend.entity.Loan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanRepo extends JpaRepository<Loan, Integer> {


    @Override
    @EntityGraph(attributePaths = {"client", "pawnshop"})
    List<Loan> findAll();

    @Override
    @EntityGraph(attributePaths = {"client", "pawnshop"})
    Page<Loan> findAll(Pageable pageable);
}

package com.pawnhop.backend.repository;

import com.pawnhop.backend.entity.Loan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("""
        SELECT l FROM Loan l
        JOIN FETCH l.pawnshop p
        JOIN FETCH l.client c
        WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(CONCAT(c.lastName, ' ', c.firstName, ' ', COALESCE(c.middleName, '')))
                LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(CAST(l.amount AS string)) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(CAST(l.issueDate AS string)) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(CAST(l.returnDate AS string)) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(CAST(l.penaltyPercent AS string)) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(CAST(l.isReturned AS string)) LIKE LOWER(CONCAT('%', :search, '%'))
        """)
    Page<Loan> search(
            @Param("search") String search,
            Pageable pageable
    );
}

package com.pawnhop.backend.repository;

import com.pawnhop.backend.entity.LoanRange;
import com.pawnhop.backend.entity.LoanRangeId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LoanRangeRepo
        extends JpaRepository<LoanRange, LoanRangeId> {

    @Query(value = """
        SELECT
            lr.loan_id,
            lr.issue_date,
            lr.pawnshop_id,
            lr.client_id,
            lr.amount,
            lr.return_date,
            lr.penalty_percent,
            lr.is_returned,
            tableoid::regclass::text AS partition
        FROM loan_range lr
        ORDER BY lr.issue_date, lr.loan_id
        """,
            countQuery = """
        SELECT COUNT(*)
        FROM loan_range
        """,
            nativeQuery = true)
    Page<Object[]> findAllWithPartition(Pageable pageable);


    @Query(value = """
        SELECT
            lr.loan_id,
            lr.issue_date,
            lr.pawnshop_id,
            lr.client_id,
            lr.amount,
            lr.return_date,
            lr.penalty_percent,
            lr.is_returned,
            tableoid::regclass::text AS partition
        FROM loan_range lr
        WHERE lr.issue_date BETWEEN :from AND :to
        ORDER BY lr.issue_date, lr.loan_id
        """,
            nativeQuery = true)
    List<Object[]> findByIssueDateBetween(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );


    @Query(value = """
        SELECT
            tableoid::regclass::text AS partition,
            COUNT(*) AS rows
        FROM loan_range
        GROUP BY tableoid
        ORDER BY partition
        """,
            nativeQuery = true)
    List<Object[]> getPartitionStats();
}
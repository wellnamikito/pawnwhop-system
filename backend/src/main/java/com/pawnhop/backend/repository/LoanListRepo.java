package com.pawnhop.backend.repository;

import com.pawnhop.backend.entity.LoanList;
import com.pawnhop.backend.entity.LoanListId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanListRepo
        extends JpaRepository<LoanList, LoanListId> {

    @Query(value = """
        SELECT
            ll.loan_id,
            ll.pawnshop_group,
            ll.pawnshop_id,
            ll.client_id,
            ll.amount,
            ll.issue_date,
            ll.return_date,
            ll.penalty_percent,
            ll.is_returned,
            tableoid::regclass::text AS partition
        FROM loan_list ll
        ORDER BY ll.pawnshop_group, ll.loan_id
        """,
            countQuery = """
        SELECT COUNT(*)
        FROM loan_list
        """,
            nativeQuery = true)
    Page<Object[]> findAllWithPartition(Pageable pageable);


    @Query(value = """
        SELECT
            ll.loan_id,
            ll.pawnshop_group,
            ll.pawnshop_id,
            ll.client_id,
            ll.amount,
            ll.issue_date,
            ll.return_date,
            ll.penalty_percent,
            ll.is_returned,
            tableoid::regclass::text AS partition
        FROM loan_list ll
        WHERE ll.pawnshop_group = :group
        ORDER BY ll.loan_id
        """,
            nativeQuery = true)
    List<Object[]> findByPawnshopGroup(
            @Param("group") Integer group
    );


    @Query(value = """
        SELECT
            tableoid::regclass::text AS partition,
            COUNT(*) AS rows
        FROM loan_list
        GROUP BY tableoid
        ORDER BY partition
        """,
            nativeQuery = true)
    List<Object[]> getPartitionStats();
}
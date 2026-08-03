package com.pawnhop.backend.report.repository;

import com.pawnhop.backend.entity.Loan;
import com.pawnhop.backend.report.dto.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ReportRepo extends JpaRepository<Loan, Integer> {

    @Query(value = """
            SELECT l.loan_id, c.last_name,
                l.amount, l.issue_date
            FROM loan l
            INNER JOIN client c
              ON l.client_id = c.client_id
            INNER JOIN pawnshop p
                ON l.pawnshop_id = p.pawnshop_id
            WHERE p.pawnshop_id = :pawnshopId
    """, nativeQuery = true)
    List<LoansByPawnshopReportDto> findLoansByPawnshop(
            @Param("pawnshopId") Integer pawnshopId
    );

    @Query(value = """
            SELECT li.loan_id,
            li.item_description, li.item_value,
            t.type_name
            FROM loan_item li
            INNER JOIN pledge_item_type t
                ON li.item_type_id = t.item_type_id
            WHERE t.item_type_id = :itemTypeId
            """, nativeQuery = true)
    List<LoanItemsByTypeReportDto> findLoanItemsByType(
            @Param("itemTypeId") Integer itemTypeId
    );

    @Query(value = """
            SELECT l.loan_id,
                    c.last_name,
                    l.amount,
                    l.issue_date
            FROM loan l
            JOIN client c ON l.client_id = c.client_id
            WHERE l.issue_date BETWEEN 
                            :startDate AND :endDate;
            """, nativeQuery = true)
    List<LoansByPeriodReportDto> findLoansByPeriod(
            @Param("startDate")LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query(value = """
            SELECT l.loan_id, c.last_name, c.phone, l.return_date
            FROM loan l
                     JOIN client c ON l.client_id = c.client_id
            WHERE l.return_date < :reportDate AND l.is_returned = false;
    """, nativeQuery = true)
    List<OverdueLoanReportDto> findOverdueLoans (
            @Param("reportDate") LocalDate reportDate
    );

    @Query(value = """
            SELECT p.name, ot.type_name AS ownership,
                   o.last_name || ' ' || o.first_name AS owner_fio,
                   d.district_name, p.address, p.phone
            FROM pawnshop p
            INNER JOIN ownership_type ot ON p.ownership_type_id = ot.ownership_type_id
            INNER JOIN owners o ON p.owner_id = o.owner_id
            INNER JOIN district d ON p.district_id = d.district_id;
            """, nativeQuery = true)
    List<PawnshopFullReportDto> findAllPawnshopsReport();

    @Query(value = """
            SELECT p.name AS pawnshop,
                       c.last_name || ' ' || c.first_name AS client_fio,
                       l.amount, l.issue_date, l.return_date, l.is_returned
                FROM loan l
                INNER JOIN pawnshop p ON l.pawnshop_id = p.pawnshop_id
                INNER JOIN client c ON l.client_id = c.client_id;
                """, nativeQuery = true)
    List<AllLoansReportDto> findAllLoansReport();

    @Query( value = """

            SELECT l.loan_id, c.last_name, t.type_name, li.item_description, li.item_value
        FROM loan_item li
        INNER JOIN loan l ON li.loan_id = l.loan_id
        INNER JOIN client c ON l.client_id = c.client_id
        INNER JOIN pledge_item_type t ON li.item_type_id = t.item_type_id;
        """, nativeQuery = true)
    List<LoanItemFullReportDto> findAllLoanItemsReport();

    @Query(value = """
            SELECT p.name, l.loan_id, l.amount, l.issue_date
    FROM pawnshop p
    LEFT JOIN loan l ON p.pawnshop_id = l.pawnshop_id
    ORDER BY p.name;
    """, nativeQuery = true)
    List<PawnshopWithLoansReportDto> findAllPawnshopsWithLoans();

    @Query(value = """
            SELECT c.last_name, c.first_name, l.loan_id, l.amount
    FROM loan l
    RIGHT JOIN client c ON l.client_id = c.client_id
    ORDER BY c.last_name;
    """, nativeQuery = true)
    List<ClientWithLoansReportDto> findAllClientsWithLoans();

    @Query(value = """
    SELECT client_id, last_name, first_name
    FROM (
     SELECT c.client_id, c.last_name, c.first_name, l.loan_id
    FROM client c
    LEFT JOIN loan l ON c.client_id = l.client_id
    ) AS client_loans
    WHERE loan_id IS NULL;
    """, nativeQuery = true)
    List<ClientWithoutLoansReportDto> findAllClientsWithoutLoans();

    @Query( value = """
        SELECT p.name, COUNT(l.loan_id) AS loan_count
        FROM pawnshop p
        INNER JOIN loan l ON p.pawnshop_id = l.pawnshop_id
        GROUP BY p.name;
    """, nativeQuery = true)
    List<PawnshopLoanCountReportDto> countLoansByPawnshop();

    @Query(value = """
        SELECT p.name, COUNT(l.loan_id) AS loan_count, SUM(l.amount) AS total_amount
        FROM pawnshop p
                 JOIN loan l ON p.pawnshop_id = l.pawnshop_id
        WHERE l.pawnshop_id = :pawnshopId
        GROUP BY p.name;
    """, nativeQuery = true)
    List<PawnshopLoanStatisticsReportDto> getPawnshopLoanStatistics(
            @Param("pawnshopId") Integer pawnshopId
    );

    @Query(value = """
        SELECT p.name, COUNT(l.loan_id) AS loan_count, AVG(l.amount) AS avg_amount
        FROM pawnshop p
                 JOIN loan l ON p.pawnshop_id = l.pawnshop_id
        WHERE p.address LIKE :addressMask
        GROUP BY p.name;
    """, nativeQuery = true)
    List<PawnshopAverageLoanReportDto> getLoanAverageByAddress(
            @Param("addressMask") String addressMask
    );

    @Query(value = """
    SELECT c.client_id, c.last_name, COUNT(l.loan_id) AS loan_count, SUM(l.amount) AS total_amount
    FROM client c
    JOIN loan l ON c.client_id = l.client_id
    WHERE c.client_id = :clientId
    GROUP BY c.client_id, c.last_name;
    """, nativeQuery = true)
    List<ClientLoanStatisticsReportDto> getClientLoanStatistics(
            @Param("clientId") Integer clientId
    );

    @Query(value = """
        SELECT c.client_id,
        c.last_name,
        c.first_name,
        COUNT(l.loan_id) AS loan_count
        FROM client c
        JOIN loan l ON c.client_id = l.client_id
        GROUP BY c.client_id, c.last_name, c.first_name
        HAVING COUNT(l.loan_id) > 1
    """, nativeQuery = true)
    List<ClientMultipleLoansReportDto> findClientWithMultipleLoans();

    @Query(value = """
    SELECT p.name,
    d.district_name,
    SUM(li.item_value) AS total_pledge_value
    FROM pawnshop p    
    JOIN district d ON p.district_id = d.district_id
    JOIN loan l ON p.pawnshop_id = l.pawnshop_id
    JOIN loan_item li ON l.loan_id = li.loan_id
    WHERE d.district_id = :districtId
    GROUP BY p.name, d.district_name
    HAVING SUM(li.item_value) > :minTotalValue
    """, nativeQuery = true)
    List<PawnshopPledgeValueReportDto> findPawnshopsByDistrictWithMinPledgeValue(
            @Param("districtId") Integer districtId,
            @Param("minTotalValue")BigDecimal minTotalValue
    );

    @Query(value = """
    SELECT sub.name,
           sub.avg_amount
    FROM (
        SELECT p.name,
               AVG(l.amount) AS avg_amount
        FROM pawnshop p
        JOIN loan l
             ON p.pawnshop_id = l.pawnshop_id
        GROUP BY p.name
    ) AS sub
    WHERE sub.avg_amount > (
        SELECT AVG(amount)
        FROM loan
    )
    ORDER BY sub.avg_amount DESC
    """, nativeQuery = true)
    List<PawnshopAboveAverageLoanReportDto> findPawnshopsWithAboveAverageLoanAmount();

    @Query(value = """
    SELECT c.client_id, c.last_name,
    c.first_name, c.phone
    FROM client c
    WHERE c.client_id IN (
    SELECT l.client_id
    FROM loan l
    JOIN loan_item li ON l.loan_id = li.loan_id
    WHERE li.item_type_id = :itemTypeId
    );
    """, nativeQuery = true)
    List<ClientByPledgeTypeReportDto> findClientsByPledgeItemType(
            @Param("itemTypeId") Integer itemTypeId
    );

    @Query(value = """
    SELECT p.pawnshop_id, p.name
    FROM pawnshop p
    WHERE p.pawnshop_id NOT IN (
    SELECT l.pawnshop_id
    FROM loan l
    JOIN loan_item li ON l.loan_id = li.loan_id
    WHERE li.item_type_id = :itemTypeId
    );
    """, nativeQuery = true)
    List<PawnshopWithoutPledgeTypeReportDto> findPawnshopsWithoutPledgeItemType(
            @Param("itemTypeId") Integer itemTypeId
    );

    @Query(value = """
        SELECT l.loan_id, c.last_name, l.amount, l.return_date,
        CASE
        WHEN l.is_returned = true THEN 'возвращена'
        WHEN l.is_returned = false AND l.return_date < CURRENT_DATE THEN 'просрочена'
        ELSE 'в процессе'
        END AS loan_status
        FROM loan l
        JOIN client c ON l.client_id = c.client_id;
    """, nativeQuery = true)
    List<LoanStatusReportDto> findLoanStatuses();

    @Query(value = """
    SELECT p.name,
    SUM(l.amount) AS pawnshop_total,
    ROUND(SUM(l.amount) / (SELECT SUM(amount) FROM loan) * 100, 2) AS percent_of_total
    FROM pawnshop p
    JOIN loan l ON p.pawnshop_id = l.pawnshop_id
    GROUP BY p.name;
    """, nativeQuery = true)
    List<PawnshopLoanShareReportDto> findPawnshopLoanShare();

    @Query(value = """
        SELECT p.name,
        COUNT(l.loan_id) AS total_loans,
        COUNT(l.loan_id) FILTER (WHERE l.is_returned = true) AS returned_count,
        COUNT(l.loan_id) FILTER (WHERE l.is_returned = false) AS not_returned_count
        FROM pawnshop p
        JOIN loan l ON p.pawnshop_id = l.pawnshop_id
        GROUP BY p.name;
    """, nativeQuery = true)
    List<PawnshopStatisticsReportDto> findPawnshopLoanStatistics();

    @Query(value = """
    SELECT l.loan_id, c.last_name, c.phone, l.amount, l.return_date,
    'просрочена' AS reason
    FROM loan l
    JOIN client c ON l.client_id = c.client_id
    WHERE l.is_returned = false AND l.return_date < CURRENT_DATE
    UNION
    SELECT l.loan_id, c.last_name, c.phone, l.amount, l.return_date,
    'крупная сумма' AS reason
    FROM loan l
    JOIN client c ON l.client_id = c.client_id
    WHERE l.amount > :largeAmountThreshold
    ORDER BY loan_id;
    """, nativeQuery = true)
    List<ProblematicLoanReportDto> findProblematicLoans(
            @Param("largeAmountThreshold") BigDecimal largeAmountThreshold
    );
}

package com.pawnhop.backend.report.repository;

import com.pawnhop.backend.entity.Loan;
import com.pawnhop.backend.report.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ReportRepo extends JpaRepository<Loan, Integer> {

    @Query(value = """
            SELECT * FROM  get_loans_by_pawnshop(:pawnshopId)""", nativeQuery = true)
    Page<LoansByPawnshopReportDto> findLoansByPawnshop(
            @Param("pawnshopId") Integer pawnshopId,
            Pageable pageable
    );

    @Query(value = """
            SELECT * FROM get_items_by_type(:itemTypeId)""", nativeQuery = true)
    Page<LoanItemsByTypeReportDto> findLoanItemsByType(
            @Param("itemTypeId") Integer itemTypeId,
            Pageable pageable
    );

    @Query(value = """
            SELECT * FROM get_loans_by_period(:startDate, :endDate)
            """, nativeQuery = true)
    Page<LoansByPeriodReportDto> findLoansByPeriod(
            @Param("startDate")LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable
    );

    @Query(value = """
            SELECT * FROM get_overdue_loans(:reportDate)""", nativeQuery = true)
    Page<OverdueLoanReportDto> findOverdueLoans (
            @Param("reportDate") LocalDate reportDate,
            Pageable pageable
    );

    @Query(value = """
            SELECT * FROM vw_pawnshop_info""", nativeQuery = true)
    Page<PawnshopFullReportDto> findAllPawnshopsReport(
            Pageable pageable
    );

    @Query(value = """
            SELECT * FROM vw_loan_info""", nativeQuery = true)
    Page<AllLoansReportDto> findAllLoansReport(
            Pageable pageable
    );

    @Query( value = """
            SELECT * FROM vw_loan_items_info""", nativeQuery = true)
    Page<LoanItemFullReportDto> findAllLoanItemsReport(
            Pageable pageable
    );

    @Query(value = """
            SELECT * FROM vw_pawnshops_with_loans""", nativeQuery = true)
    Page<PawnshopWithLoansReportDto> findAllPawnshopsWithLoans(
            Pageable pageable
    );

    @Query(value = """
            SELECT * FROM vw_clients_with_loans""", nativeQuery = true)
    Page<ClientWithLoansReportDto> findAllClientsWithLoans(
            Pageable pageable
    );

    @Query(value = """
    SELECT * FROM vw_clients_without_loans;""", nativeQuery = true)
    Page<ClientWithoutLoansReportDto> findAllClientsWithoutLoans(
            Pageable pageable
    );

    @Query( value = """
        SELECT * FROM vw_pawnshop_loan_count;
    """, nativeQuery = true)
    Page<PawnshopLoanCountReportDto> countLoansByPawnshop(
            Pageable pageable
    );

    @Query(value = """
        SELECT * FROM get_pawnshop_statistics(:pawnshopId)""", nativeQuery = true)
    List<PawnshopLoanStatisticsReportDto> getPawnshopLoanStatistics(
            @Param("pawnshopId") Integer pawnshopId
    );

    @Query(value = """
        SELECT * FROM get_pawnshops_by_address(:addressMask)""", nativeQuery = true)
    Page<PawnshopAverageLoanReportDto> getLoanAverageByAddress(
            @Param("addressMask") String addressMask,
            Pageable pageable
    );

    @Query(value = """
    SELECT * FROM get_client_statistics_by_id(:clientId)""", nativeQuery = true)
    List<ClientLoanStatisticsReportDto> getClientLoanStatistics(
            @Param("clientId") Integer clientId
    );

    @Query(value = """
        SELECT * FROM vw_pawnshop_loan_count;""", nativeQuery = true)
    Page<ClientMultipleLoansReportDto> findClientWithMultipleLoans(
            Pageable pageable
    );

    @Query(value = """
    SELECT * FROM get_district_pledge_value(:districtId, :minTotalValue)""", nativeQuery = true)
    Page<PawnshopPledgeValueReportDto> findPawnshopsByDistrictWithMinPledgeValue(
            @Param("districtId") Integer districtId,
            @Param("minTotalValue")BigDecimal minTotalValue,
            Pageable pageable
    );

    @Query(value = """
    SELECT * FROM vw_pawnshop_above_average_loan_count""", nativeQuery = true)
    Page<PawnshopAboveAverageLoanReportDto> findPawnshopsWithAboveAverageLoanAmount(
            Pageable pageable
    );

    @Query(value = """
    SELECT * FROM get_clients_by_item_type(:itemTypeId);
    """, nativeQuery = true)
    Page<ClientByPledgeTypeReportDto> findClientsByPledgeItemType(
            @Param("itemTypeId") Integer itemTypeId,
            Pageable pageable
    );

    @Query(value = """
    SELECT * FROM get_pawnshops_without_item_type(:itemTypeId);
    """, nativeQuery = true)
    Page<PawnshopWithoutPledgeTypeReportDto> findPawnshopsWithoutPledgeItemType(
            @Param("itemTypeId") Integer itemTypeId,
            Pageable pageable
    );

    @Query(value = """
        SELECT * FROM vw_loan_status""", nativeQuery = true)
    Page<LoanStatusReportDto> findLoanStatuses(
            Pageable pageable
    );

    @Query(value = """
    SELECT * FROM vw_pawnshop_total_share""", nativeQuery = true)
    List<PawnshopLoanShareReportDto> findPawnshopLoanShare();

    @Query(value = """
        SELECT * FROM vw_pawnshop_loan_statistics""", nativeQuery = true)
    List<PawnshopStatisticsReportDto> findPawnshopLoanStatistics();

    @Query(value = """
    SELECT * FROM get_large_or_overdue_loans(:largeAmountThreshold)""", nativeQuery = true)
    Page<ProblematicLoanReportDto> findProblematicLoans(
            @Param("largeAmountThreshold") BigDecimal largeAmountThreshold,
            Pageable pageable
    );
}

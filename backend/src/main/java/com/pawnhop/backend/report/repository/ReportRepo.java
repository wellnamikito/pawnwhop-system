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
            SELECT * FROM  get_loans_by_pawnshop(:pawnshopId)""", nativeQuery = true)
    List<LoansByPawnshopReportDto> findLoansByPawnshop(
            @Param("pawnshopId") Integer pawnshopId
    );

    @Query(value = """
            SELECT * FROM get_items_by_type(:itemTypeId)""", nativeQuery = true)
    List<LoanItemsByTypeReportDto> findLoanItemsByType(
            @Param("itemTypeId") Integer itemTypeId
    );

    @Query(value = """
            SELECT * FROM get_loans_by_period(:startDate, :endDate)
            """, nativeQuery = true)
    List<LoansByPeriodReportDto> findLoansByPeriod(
            @Param("startDate")LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query(value = """
            SELECT * FROM get_overdue_loans(:reportDate)""", nativeQuery = true)
    List<OverdueLoanReportDto> findOverdueLoans (
            @Param("reportDate") LocalDate reportDate
    );

    @Query(value = """
            SELECT * FROM vw_pawnshop_info""", nativeQuery = true)
    List<PawnshopFullReportDto> findAllPawnshopsReport();

    @Query(value = """
            SELECT * FROM vw_loan_info""", nativeQuery = true)
    List<AllLoansReportDto> findAllLoansReport();

    @Query( value = """
            SELECT * FROM vw_loan_items_info""", nativeQuery = true)
    List<LoanItemFullReportDto> findAllLoanItemsReport();

    @Query(value = """
            SELECT * FROM vw_pawnshops_with_loans""", nativeQuery = true)
    List<PawnshopWithLoansReportDto> findAllPawnshopsWithLoans();

    @Query(value = """
            SELECT * FROM vw_clients_with_loans""", nativeQuery = true)
    List<ClientWithLoansReportDto> findAllClientsWithLoans();

    @Query(value = """
    SELECT * FROM vw_clients_without_loans;""", nativeQuery = true)
    List<ClientWithoutLoansReportDto> findAllClientsWithoutLoans();

    @Query( value = """
        SELECT * FROM vw_pawnshop_loan_count;
    """, nativeQuery = true)
    List<PawnshopLoanCountReportDto> countLoansByPawnshop();

    @Query(value = """
        SELECT * FROM get_pawnshop_statistics(:pawnshopId)""", nativeQuery = true)
    List<PawnshopLoanStatisticsReportDto> getPawnshopLoanStatistics(
            @Param("pawnshopId") Integer pawnshopId
    );

    @Query(value = """
        SELECT * FROM get_pawnshops_by_address(:addressMask)""", nativeQuery = true)
    List<PawnshopAverageLoanReportDto> getLoanAverageByAddress(
            @Param("addressMask") String addressMask
    );

    @Query(value = """
    SELECT * FROM get_client_statistics_by_id(:clientId)""", nativeQuery = true)
    List<ClientLoanStatisticsReportDto> getClientLoanStatistics(
            @Param("clientId") Integer clientId
    );

    @Query(value = """
        SELECT * FROM vw_pawnshop_loan_count;""", nativeQuery = true)
    List<ClientMultipleLoansReportDto> findClientWithMultipleLoans();

    @Query(value = """
    SELECT * FROM get_district_pledge_value(:districtId, :minTotalValue)""", nativeQuery = true)
    List<PawnshopPledgeValueReportDto> findPawnshopsByDistrictWithMinPledgeValue(
            @Param("districtId") Integer districtId,
            @Param("minTotalValue")BigDecimal minTotalValue
    );

    @Query(value = """
    SELECT * FROM vw_pawnshop_above_average_loan_count""", nativeQuery = true)
    List<PawnshopAboveAverageLoanReportDto> findPawnshopsWithAboveAverageLoanAmount();

    @Query(value = """
    SELECT * FROM get_clients_by_item_type(:itemTypeId);
    """, nativeQuery = true)
    List<ClientByPledgeTypeReportDto> findClientsByPledgeItemType(
            @Param("itemTypeId") Integer itemTypeId
    );

    @Query(value = """
    SELECT * get_pawnshops_without_item_type(:itemTypeId);
    """, nativeQuery = true)
    List<PawnshopWithoutPledgeTypeReportDto> findPawnshopsWithoutPledgeItemType(
            @Param("itemTypeId") Integer itemTypeId
    );

    @Query(value = """
        SELECT * FROM vw_loan_status""", nativeQuery = true)
    List<LoanStatusReportDto> findLoanStatuses();

    @Query(value = """
    SELECT * FROM vw_pawnshop_total_share""", nativeQuery = true)
    List<PawnshopLoanShareReportDto> findPawnshopLoanShare();

    @Query(value = """
        SELECT * FROM vw_pawnshop_loan_statistics""", nativeQuery = true)
    List<PawnshopStatisticsReportDto> findPawnshopLoanStatistics();

    @Query(value = """
    SELECT * get_large_or_overdue_loans(:largeAmountThreshold)""", nativeQuery = true)
    List<ProblematicLoanReportDto> findProblematicLoans(
            @Param("largeAmountThreshold") BigDecimal largeAmountThreshold
    );
}

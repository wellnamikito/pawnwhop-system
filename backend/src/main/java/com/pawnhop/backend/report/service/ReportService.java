package com.pawnhop.backend.report.service;


import com.pawnhop.backend.report.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ReportService {

    Page<LoansByPawnshopReportDto> getFindLoansByPawnshop(Integer pawnshopId, Pageable pageable);

    Page<LoanItemsByTypeReportDto> getFindLoanItemsByType(Integer itemTypeId, Pageable pageable);

    Page<LoansByPeriodReportDto> getFindLoansByPeriod(LocalDate startDate, LocalDate endDate, Pageable pageable);

    Page<OverdueLoanReportDto> getFindOverdueLoans(LocalDate reportDate, Pageable pageable);

    Page<PawnshopFullReportDto> getFindAllPawnshopsReport(Pageable pageable);

    Page<AllLoansReportDto> getFindAllLoansReport(Pageable pageable);

    Page<LoanItemFullReportDto> getFindAllLoanItemsReport(Pageable pageable);

    Page<PawnshopWithLoansReportDto> getFindAllPawnshopsWithLoans(Pageable pageable);

    Page<ClientWithLoansReportDto> getFindAllClientsWithLoans(Pageable pageable);

    Page<ClientWithoutLoansReportDto> getFindAllClientsWithoutLoans(Pageable pageable);

    Page<PawnshopLoanCountReportDto> getCountLoansByPawnshop(Pageable pageable);

    List<PawnshopLoanStatisticsReportDto> getPawnshopLoanStatistic(Integer pawnshopId);

    Page<PawnshopAverageLoanReportDto> getLoanAverageByAddress(String addressMask, Pageable pageable);

    List<ClientLoanStatisticsReportDto> getClientLoanStatistics(Integer clientId);

    Page<ClientMultipleLoansReportDto> getFindClientWithMultipleLoans(Pageable pageable);

    Page<PawnshopPledgeValueReportDto> getFindPawnshopsByDistrictWithMinPledgeValue(
            Integer districtId,
            BigDecimal minTotalValue,
            Pageable pageable
    );

    Page<PawnshopAboveAverageLoanReportDto> getFindPawnshopsWithAboveAverageLoanAmount(Pageable pageable);

    Page<ClientByPledgeTypeReportDto> getFindClientsByPledgeItemType(Integer itemTypeId, Pageable pageable);

    Page<PawnshopWithoutPledgeTypeReportDto> getFindPawnshopsWithoutPledgeItemType(Integer itemTypeId, Pageable pageable);

    Page<LoanStatusReportDto> getFindLoanStatuses(Pageable pageable);

    List<PawnshopLoanShareReportDto> getFindPawnshopLoanShare();

    List<PawnshopStatisticsReportDto> getFindPawnshopLoanStatistics();

    Page<ProblematicLoanReportDto> getFindProblematicLoans(
         BigDecimal largeAmountThreshold,
         Pageable pageable
    );
}

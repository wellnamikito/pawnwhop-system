package com.pawnhop.backend.report.service;


import com.pawnhop.backend.report.dto.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ReportService {

    List<LoansByPawnshopReportDto> getFindLoansByPawnshop(Integer pawnshopId);

    List<LoanItemsByTypeReportDto> getFindLoanItemsByType(Integer itemTypeId);

    List<LoansByPeriodReportDto> getFindLoansByPeriod(LocalDate startDate, LocalDate endDate);

    List<OverdueLoanReportDto> getFindOverdueLoans(LocalDate reportDate);

    List<PawnshopFullReportDto> getFindAllPawnshopsReport();

    List<AllLoansReportDto> getFindAllLoansReport();

    List<LoanItemFullReportDto> getFindAllLoanItemsReport();

    List<PawnshopWithLoansReportDto> getFindAllPawnshopsWithLoans();

    List<ClientWithLoansReportDto> getFindAllClientsWithLoans();

    List<ClientWithoutLoansReportDto> getFindAllClientsWithoutLoans();

    List<PawnshopLoanCountReportDto> getCountLoansByPawnshop();

    List<PawnshopLoanStatisticsReportDto> getPawnshopLoanStatistic(Integer pawnshopId);

    List<PawnshopAverageLoanReportDto> getLoanAverageByAddress(String addressMask);

    List<ClientLoanStatisticsReportDto> getClientLoanStatistics(Integer clientId);

    List<ClientMultipleLoansReportDto> getFindClientWithMultipleLoans();

    List<PawnshopPledgeValueReportDto> getFindPawnshopsByDistrictWithMinPledgeValue(
            Integer districtId,
            BigDecimal minTotalValue
    );

    List<PawnshopAboveAverageLoanReportDto> getFindPawnshopsWithAboveAverageLoanAmount();

    List<ClientByPledgeTypeReportDto> getFindClientsByPledgeItemType(Integer itemTypeId);

    List<PawnshopWithoutPledgeTypeReportDto> getFindPawnshopsWithoutPledgeItemType(Integer itemTypeId);

    List<LoanStatusReportDto> getFindLoanStatuses();

    List<PawnshopLoanShareReportDto> getFindPawnshopLoanShare();

    List<PawnshopStatisticsReportDto> getFindPawnshopLoanStatistics();

    List<ProblematicLoanReportDto> getFindProblematicLoans(
         BigDecimal largeAmountThreshold
    );
}

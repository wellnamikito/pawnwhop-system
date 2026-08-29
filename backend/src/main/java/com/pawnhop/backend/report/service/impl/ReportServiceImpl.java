package com.pawnhop.backend.report.service.impl;

import com.pawnhop.backend.report.dto.*;
import com.pawnhop.backend.report.repository.ReportRepo;
import com.pawnhop.backend.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ReportRepo reportRepo;


    @Override
    public Page<LoansByPawnshopReportDto> getFindLoansByPawnshop(
            Integer pawnshopId,
            Pageable pageable) {
        return reportRepo.findLoansByPawnshop(pawnshopId, pageable);
    }

    @Override
    public Page<LoanItemsByTypeReportDto> getFindLoanItemsByType(
            Integer itemTypeId,
            Pageable pageable) {
        return reportRepo.findLoanItemsByType(itemTypeId, pageable);
    }

    @Override
    public Page<LoansByPeriodReportDto> getFindLoansByPeriod(
            LocalDate startDate,
            LocalDate endDate,
            Pageable pageable) {
        return reportRepo.findLoansByPeriod(startDate, endDate,pageable);
    }

    @Override
    public Page<OverdueLoanReportDto> getFindOverdueLoans(
            LocalDate reportDate,
            Pageable pageable) {
        return reportRepo.findOverdueLoans(reportDate,  pageable);
    }

    @Override
    public Page<PawnshopFullReportDto> getFindAllPawnshopsReport(
            Pageable pageable
    ) {
        return reportRepo.findAllPawnshopsReport(pageable);
    }

    @Override
    public Page<AllLoansReportDto> getFindAllLoansReport(
            Pageable pageable
    ) {
        return reportRepo.findAllLoansReport(pageable);
    }

    @Override
    public Page<LoanItemFullReportDto> getFindAllLoanItemsReport(
            Pageable pageable
    ) {
        return reportRepo.findAllLoanItemsReport(pageable);
    }

    @Override
    public Page<PawnshopWithLoansReportDto> getFindAllPawnshopsWithLoans(
            Pageable pageable
    ) {
        return reportRepo.findAllPawnshopsWithLoans(pageable);
    }

    @Override
    public Page<ClientWithLoansReportDto> getFindAllClientsWithLoans(
            Pageable pageable
    ) {
        return reportRepo.findAllClientsWithLoans(pageable);
    }

    @Override
    public Page<ClientWithoutLoansReportDto> getFindAllClientsWithoutLoans(
            Pageable pageable
    ) {
        return reportRepo.findAllClientsWithoutLoans(pageable);
    }

    @Override
    public Page<PawnshopLoanCountReportDto> getCountLoansByPawnshop(
            Pageable pageable
    ) {
        return reportRepo.countLoansByPawnshop(pageable);
    }

    @Override
    public List<PawnshopLoanStatisticsReportDto> getPawnshopLoanStatistic(Integer pawnshopId) {
        return reportRepo.getPawnshopLoanStatistics(pawnshopId);
    }

    @Override
    public Page<PawnshopAverageLoanReportDto> getLoanAverageByAddress(
            String addressMask,
            Pageable pageable) {
        return reportRepo.getLoanAverageByAddress(addressMask,pageable);
    }

    @Override
    public List<ClientLoanStatisticsReportDto> getClientLoanStatistics(Integer clientId) {
        return reportRepo.getClientLoanStatistics(clientId);
    }

    @Override
    public Page<ClientMultipleLoansReportDto> getFindClientWithMultipleLoans(
            Pageable pageable
    ) {
        return reportRepo.findClientWithMultipleLoans(pageable);
    }

    @Override
    public Page<PawnshopPledgeValueReportDto> getFindPawnshopsByDistrictWithMinPledgeValue(
            Integer districtId,
            BigDecimal minTotalValue,
            Pageable pageable) {
        return reportRepo.findPawnshopsByDistrictWithMinPledgeValue(districtId, minTotalValue, pageable);
    }

    @Override
    public Page<PawnshopAboveAverageLoanReportDto> getFindPawnshopsWithAboveAverageLoanAmount(
            Pageable pageable
    ) {
        return reportRepo.findPawnshopsWithAboveAverageLoanAmount(pageable);
    }

    @Override
    public Page<ClientByPledgeTypeReportDto> getFindClientsByPledgeItemType(
            Integer itemTypeId,
            Pageable pageable) {
        return reportRepo.findClientsByPledgeItemType(itemTypeId,pageable);
    }

    @Override
    public Page<PawnshopWithoutPledgeTypeReportDto> getFindPawnshopsWithoutPledgeItemType(
            Integer itemTypeId,
            Pageable pageable) {
        return reportRepo.findPawnshopsWithoutPledgeItemType(itemTypeId, pageable);
    }

    @Override
    public Page<LoanStatusReportDto> getFindLoanStatuses(
            Pageable pageable) {
        return reportRepo.findLoanStatuses(pageable);
    }

    @Override
    public List<PawnshopLoanShareReportDto> getFindPawnshopLoanShare() {
        return reportRepo.findPawnshopLoanShare();
    }

    @Override
    public List<PawnshopStatisticsReportDto> getFindPawnshopLoanStatistics() {
        return reportRepo.findPawnshopLoanStatistics();
    }

    @Override
    public Page<ProblematicLoanReportDto> getFindProblematicLoans(
            BigDecimal largeAmountThreshold,
            Pageable pageable) {
        return reportRepo.findProblematicLoans(largeAmountThreshold, pageable);
    }


}

package com.pawnhop.backend.report.service.impl;

import com.pawnhop.backend.report.dto.*;
import com.pawnhop.backend.report.repository.ReportRepo;
import com.pawnhop.backend.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ReportRepo reportRepo;


    @Override
    public List<LoansByPawnshopReportDto> getFindLoansByPawnshop(Integer pawnshopId) {
        return reportRepo.findLoansByPawnshop(pawnshopId);
    }

    @Override
    public List<LoanItemsByTypeReportDto> getFindLoanItemsByType(Integer itemTypeId) {
        return reportRepo.findLoanItemsByType(itemTypeId);
    }

    @Override
    public List<LoansByPeriodReportDto> getFindLoansByPeriod(LocalDate startDate, LocalDate endDate) {
        return reportRepo.findLoansByPeriod(startDate, endDate);
    }

    @Override
    public List<OverdueLoanReportDto> getFindOverdueLoans(LocalDate reportDate) {
        return reportRepo.findOverdueLoans(reportDate);
    }

    @Override
    public List<PawnshopFullReportDto> getFindAllPawnshopsReport() {
        return reportRepo.findAllPawnshopsReport();
    }

    @Override
    public List<AllLoansReportDto> getFindAllLoansReport() {
        return reportRepo.findAllLoansReport();
    }

    @Override
    public List<LoanItemFullReportDto> getFindAllLoanItemsReport() {
        return reportRepo.findAllLoanItemsReport();
    }

    @Override
    public List<PawnshopWithLoansReportDto> getFindAllPawnshopsWithLoans() {
        return reportRepo.findAllPawnshopsWithLoans();
    }

    @Override
    public List<ClientWithLoansReportDto> getFindAllClientsWithLoans() {
        return reportRepo.findAllClientsWithLoans();
    }

    @Override
    public List<ClientWithoutLoansReportDto> getFindAllClientsWithoutLoans() {
        return reportRepo.findAllClientsWithoutLoans();
    }

    @Override
    public List<PawnshopLoanCountReportDto> getCountLoansByPawnshop() {
        return reportRepo.countLoansByPawnshop();
    }

    @Override
    public List<PawnshopLoanStatisticsReportDto> getPawnshopLoanStatistic(Integer pawnshopId) {
        return reportRepo.getPawnshopLoanStatistics(pawnshopId);
    }

    @Override
    public List<PawnshopAverageLoanReportDto> getLoanAverageByAddress(String addressMask) {
        return reportRepo.getLoanAverageByAddress(addressMask);
    }

    @Override
    public List<ClientLoanStatisticsReportDto> getClientLoanStatistics(Integer clientId) {
        return reportRepo.getClientLoanStatistics(clientId);
    }

    @Override
    public List<ClientMultipleLoansReportDto> getFindClientWithMultipleLoans() {
        return reportRepo.findClientWithMultipleLoans();
    }

    @Override
    public List<PawnshopPledgeValueReportDto> getFindPawnshopsByDistrictWithMinPledgeValue(Integer districtId, BigDecimal minTotalValue) {
        return reportRepo.findPawnshopsByDistrictWithMinPledgeValue(districtId, minTotalValue);
    }

    @Override
    public List<PawnshopAboveAverageLoanReportDto> getFindPawnshopsWithAboveAverageLoanAmount() {
        return reportRepo.findPawnshopsWithAboveAverageLoanAmount();
    }

    @Override
    public List<ClientByPledgeTypeReportDto> getFindClientsByPledgeItemType(Integer itemTypeId) {
        return reportRepo.findClientsByPledgeItemType(itemTypeId);
    }

    @Override
    public List<PawnshopWithoutPledgeTypeReportDto> getFindPawnshopsWithoutPledgeItemType(Integer itemTypeId) {
        return reportRepo.findPawnshopsWithoutPledgeItemType(itemTypeId);
    }

    @Override
    public List<LoanStatusReportDto> getFindLoanStatuses() {
        return reportRepo.findLoanStatuses();
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
    public List<ProblematicLoanReportDto> getFindProblematicLoans(BigDecimal largeAmountThreshold) {
        return reportRepo.findProblematicLoans(largeAmountThreshold);
    }


}

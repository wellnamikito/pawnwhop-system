package com.pawnhop.backend.report.controller;

import com.pawnhop.backend.report.dto.*;
import com.pawnhop.backend.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/report")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/loans-by-pawnshop/{pawnshopId}")
    public List<LoansByPawnshopReportDto> findLoansByPawnshop(
            @PathVariable Integer pawnshopId
    ){
        return reportService.getFindLoansByPawnshop(pawnshopId);
    }

    @GetMapping("/loans-items-by-type/{itemTypeId}")
    public List<LoanItemsByTypeReportDto> findLoanItemsByType(
            @PathVariable Integer itemTypeId
    ){
        return reportService.getFindLoanItemsByType(itemTypeId);
    }

    @GetMapping("/loans/period")
    public List<LoansByPeriodReportDto> findLoansByPeriod(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ){
        return reportService.getFindLoansByPeriod(startDate, endDate);
    }

    @GetMapping("/loans/overdue")
    public List<OverdueLoanReportDto> findOverdueLoans(
            @RequestParam LocalDate reportDate
    ){
        return reportService.getFindOverdueLoans(reportDate);
    }

    @GetMapping("/pawnshops")
    public List<PawnshopFullReportDto> findAllPawnshopsReport(){
        return reportService.getFindAllPawnshopsReport();
    }

    @GetMapping("/loans")
    public List<AllLoansReportDto> findAllLoansReport(){
        return reportService.getFindAllLoansReport();
    }

    @GetMapping("/loan-items")
    public List<LoanItemFullReportDto> findAllLoanItemsReport(){
        return reportService.getFindAllLoanItemsReport();
    }

    @GetMapping("/pawnshops-with-loans")
    public List<PawnshopWithLoansReportDto> findAllPawnshopsWithLoans(){
        return reportService.getFindAllPawnshopsWithLoans();
    }

    @GetMapping("/clients-with-loans")
    public List<ClientWithLoansReportDto> findAllClientsWithLoans(){
        return reportService.getFindAllClientsWithLoans();
    }

    @GetMapping("/clients-without-loans")
    public List<ClientWithoutLoansReportDto> findAllClientsWithoutLoans(){
        return reportService.getFindAllClientsWithoutLoans();
    }

    @GetMapping("/statistics/loans-count")
    public List<PawnshopLoanCountReportDto> countLoansByPawnshop(){
        return reportService.getCountLoansByPawnshop();
    }

    @GetMapping("/statistics/pawnshop/{pawnshopId}")
    public List<PawnshopLoanStatisticsReportDto> getPawnshopLoanStatistics(
            @PathVariable Integer pawnshopId
    ){
        return reportService.getPawnshopLoanStatistic(pawnshopId);
    }

    @GetMapping("/statistics/address")
    public List<PawnshopAverageLoanReportDto> getLoanAverageByAddress(
            @RequestParam String address
    ){
        return reportService.getLoanAverageByAddress(
                "%" + address + "%"
        );
    }

    @GetMapping("/clients/{clientId}/loans/statistics")
    public List<ClientLoanStatisticsReportDto> getClientLoanStatistics(
            @PathVariable Integer clientId
    ){

        return reportService.getClientLoanStatistics(clientId);
    }

    @GetMapping("/clients/multiple-loans")
    public List<ClientMultipleLoansReportDto> getClientsWithMultipleLoans() {
        return reportService.getFindClientWithMultipleLoans();
    }

    @GetMapping("/pawnshops/pledge-value")
    public List<PawnshopPledgeValueReportDto> getPawnshopsByDistrictWithMinPledgeValue(
            @RequestParam Integer districtId,
            @RequestParam BigDecimal minTotalValue
    ){
        return reportService.getFindPawnshopsByDistrictWithMinPledgeValue(
                districtId,
                minTotalValue
        );
    }

    @GetMapping("/pawnshops/above-average-loans")
    public List<PawnshopAboveAverageLoanReportDto> getPawnshopsWithAboveAverageLoanAmount(){
        return reportService.getFindPawnshopsWithAboveAverageLoanAmount();
    }

    @GetMapping("/clients/by-pledge-item-type/{itemTypeId}")
    public List<ClientByPledgeTypeReportDto> findClientsByPledgeItemType(
            @PathVariable Integer itemTypeId
    ){
        return reportService.getFindClientsByPledgeItemType(itemTypeId);
    }

    @GetMapping("/pawnshops/without-pledge-item-type/{itemTypeId}")
    public List<PawnshopWithoutPledgeTypeReportDto> findPawnshopsWithoutPledgeItemType(
            @PathVariable Integer itemTypeId
    ){
        return reportService.getFindPawnshopsWithoutPledgeItemType(itemTypeId);
    }

    @GetMapping("/loans/statuses")
    public List<LoanStatusReportDto> findLoanStatuses(){
        return reportService.getFindLoanStatuses();
    }

    @GetMapping("/pawnshops/loan-share")
    public List<PawnshopLoanShareReportDto> findPawnshopLoanShare(){
        return reportService.getFindPawnshopLoanShare();
    }

    @GetMapping("/pawnshops/loan-statistics")
    public List<PawnshopStatisticsReportDto> findPawnshopLoanStatistics(){
        return reportService.getFindPawnshopLoanStatistics();
    }

    @GetMapping("/loans/problematic")
    public List<ProblematicLoanReportDto> findProblematicLoans(
            @RequestParam BigDecimal largeAmountThreshold
    ){
        return reportService.getFindProblematicLoans(largeAmountThreshold);
    }
}

package com.pawnhop.backend.report.controller;

import com.pawnhop.backend.report.dto.*;
import com.pawnhop.backend.report.service.ClientEditViewService;
import com.pawnhop.backend.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/report")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final ClientEditViewService clientEditViewService;

    @GetMapping("/loans-by-pawnshop/{pawnshopId}")
    public Page<LoansByPawnshopReportDto> findLoansByPawnshop(
            @PathVariable Integer pawnshopId,
            @PageableDefault(size = 50) Pageable pageable
    ){
        return reportService.getFindLoansByPawnshop(pawnshopId,pageable);
    }

    @GetMapping("/loans-items-by-type/{itemTypeId}")
    public Page<LoanItemsByTypeReportDto> findLoanItemsByType(
            @PathVariable Integer itemTypeId,
            @PageableDefault(size = 50) Pageable pageable
    ){
        return reportService.getFindLoanItemsByType(itemTypeId, pageable);
    }

    @GetMapping("/loans/period")
    public Page<LoansByPeriodReportDto> findLoansByPeriod(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate,
            @PageableDefault(size = 50) Pageable pageable
    ){
        return reportService.getFindLoansByPeriod(startDate, endDate, pageable);
    }

    @GetMapping("/loans/overdue")
    public Page<OverdueLoanReportDto> findOverdueLoans(
            @RequestParam LocalDate reportDate,
            @PageableDefault(size = 50) Pageable pageable
    ){
        return reportService.getFindOverdueLoans(reportDate, pageable);
    }

    @GetMapping("/pawnshops")
    public Page<PawnshopFullReportDto> findAllPawnshopsReport(
            @PageableDefault(size = 50) Pageable pageable
    ){
        return reportService.getFindAllPawnshopsReport(pageable);
    }

    @GetMapping("/loans")
    public Page<AllLoansReportDto> findAllLoansReport(
            @PageableDefault(size = 50) Pageable pageable
    ){
        return reportService.getFindAllLoansReport(pageable);
    }

    @GetMapping("/loan-items")
    public Page<LoanItemFullReportDto> findAllLoanItemsReport(
            @PageableDefault(size = 50) Pageable pageable
    ){
        return reportService.getFindAllLoanItemsReport(pageable);
    }

    @GetMapping("/pawnshops-with-loans")
    public Page<PawnshopWithLoansReportDto> findAllPawnshopsWithLoans(
            @PageableDefault(size = 50) Pageable pageable
    ){
        return reportService.getFindAllPawnshopsWithLoans(pageable);
    }

    @GetMapping("/clients-with-loans")
    public Page<ClientWithLoansReportDto> findAllClientsWithLoans(
            @PageableDefault(size = 50) Pageable pageable
    ){
        return reportService.getFindAllClientsWithLoans(pageable);
    }

    @GetMapping("/clients-without-loans")
    public Page<ClientWithoutLoansReportDto> findAllClientsWithoutLoans(
            @PageableDefault(size = 50) Pageable pageable
    ){
        return reportService.getFindAllClientsWithoutLoans(pageable);
    }

    @GetMapping("/statistics/loans-count")
    public Page<PawnshopLoanCountReportDto> countLoansByPawnshop(
            @PageableDefault(size = 50) Pageable pageable
    ){
        return reportService.getCountLoansByPawnshop(pageable);
    }

    @GetMapping("/statistics/pawnshop/{pawnshopId}")
    public List<PawnshopLoanStatisticsReportDto> getPawnshopLoanStatistics(
            @PathVariable Integer pawnshopId
    ){
        return reportService.getPawnshopLoanStatistic(pawnshopId);
    }

    @GetMapping("/statistics/address")
    public Page<PawnshopAverageLoanReportDto> getLoanAverageByAddress(
            @RequestParam String address,
            @PageableDefault(size = 50) Pageable pageable
    ){
        return reportService.getLoanAverageByAddress(
                "%" + address + "%",
                pageable
        );
    }

    @GetMapping("/clients/{clientId}/loans/statistics")
    public List<ClientLoanStatisticsReportDto> getClientLoanStatistics(
            @PathVariable Integer clientId
    ){

        return reportService.getClientLoanStatistics(clientId);
    }

    @GetMapping("/clients/multiple-loans")
    public Page<ClientMultipleLoansReportDto> getClientsWithMultipleLoans(
            @PageableDefault(size = 50) Pageable pageable
    ) {
        return reportService.getFindClientWithMultipleLoans(pageable);
    }

    @GetMapping("/pawnshops/pledge-value")
    public Page<PawnshopPledgeValueReportDto> getPawnshopsByDistrictWithMinPledgeValue(
            @RequestParam Integer districtId,
            @RequestParam BigDecimal minTotalValue,
            @PageableDefault(size = 50) Pageable pageable
    ){
        return reportService.getFindPawnshopsByDistrictWithMinPledgeValue(
                districtId,
                minTotalValue,
                pageable
        );
    }

    @GetMapping("/pawnshops/above-average-loans")
    public Page<PawnshopAboveAverageLoanReportDto> getPawnshopsWithAboveAverageLoanAmount(
            @PageableDefault(size = 50) Pageable pageable
    ){
        return reportService.getFindPawnshopsWithAboveAverageLoanAmount(pageable);
    }

    @GetMapping("/clients/by-pledge-item-type/{itemTypeId}")
    public Page<ClientByPledgeTypeReportDto> findClientsByPledgeItemType(
            @PathVariable Integer itemTypeId,
            @PageableDefault(size = 50) Pageable pageable
    ){
        return reportService.getFindClientsByPledgeItemType(itemTypeId, pageable);
    }

    @GetMapping("/pawnshops/without-pledge-item-type/{itemTypeId}")
    public Page<PawnshopWithoutPledgeTypeReportDto> findPawnshopsWithoutPledgeItemType(
            @PathVariable Integer itemTypeId,
            @PageableDefault(size = 50) Pageable pageable
    ){
        return reportService.getFindPawnshopsWithoutPledgeItemType(itemTypeId, pageable);
    }

    @GetMapping("/loans/statuses")
    public Page<LoanStatusReportDto> findLoanStatuses(
            @PageableDefault(size = 50) Pageable pageable
    ){
        return reportService.getFindLoanStatuses(pageable);
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
    public Page<ProblematicLoanReportDto> findProblematicLoans(
            @RequestParam BigDecimal largeAmountThreshold,
            @PageableDefault(size = 50) Pageable pageable
    ){
        return reportService.getFindProblematicLoans(largeAmountThreshold, pageable);
    }


    @GetMapping("/clients/edit-view")
    public Page<ClientEditViewDto> getClientsFromEditView(
            @PageableDefault(size =  50) Pageable pageable
    ){
        return clientEditViewService.getClientsFromEditView(pageable);
    }

    @PutMapping("/clients/edit-view")
    public void updateClientThroughEditView(
            @RequestBody ClientEditViewDto dto
    ) throws IllegalAccessException {
        clientEditViewService.updateClientThroughEditView(dto);
    }
}

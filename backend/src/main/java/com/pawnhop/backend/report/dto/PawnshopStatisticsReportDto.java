package com.pawnhop.backend.report.dto;


public record PawnshopStatisticsReportDto(

        String name,
        Long totalLoans,
        Long returnedCount,
        Long notReturnedCount
) {}

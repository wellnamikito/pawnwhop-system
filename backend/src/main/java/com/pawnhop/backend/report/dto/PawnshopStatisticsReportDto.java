package com.pawnhop.backend.report.dto;


public record PawnshopStatisticsReportDto(
        Integer pawnshopId,
        String name,
        Long totalLoans,
        Long returnedCount,
        Long notReturnedCount
) {}

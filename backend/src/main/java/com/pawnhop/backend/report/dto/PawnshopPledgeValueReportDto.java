package com.pawnhop.backend.report.dto;



import java.math.BigDecimal;


public record PawnshopPledgeValueReportDto(

        String name,
        String districtName,
        BigDecimal totalPledgeValue
) {}

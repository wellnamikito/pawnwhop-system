package com.pawnhop.backend.report.dto;




public record ClientByPledgeTypeReportDto(
        Integer clientId,
        String lastName,
        String firstName,
        String phone
) {}

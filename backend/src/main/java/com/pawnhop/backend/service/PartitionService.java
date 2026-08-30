package com.pawnhop.backend.service;

import com.pawnhop.backend.dto.response.LoanListResponseDto;
import com.pawnhop.backend.dto.response.LoanRangeResponseDto;
import com.pawnhop.backend.dto.response.PartitionOverviewDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface PartitionService {

    Page<LoanRangeResponseDto> getLoanRangePage(
            Pageable pageable
    );

    List<LoanRangeResponseDto> getLoanRangeByDate(
            LocalDate from,
            LocalDate to
    );

    Page<LoanListResponseDto> getLoanListPage(
            Pageable pageable
    );

    List<LoanListResponseDto> getLoanListByGroup(
            Integer group
    );

    PartitionOverviewDto getRangeStats();

    PartitionOverviewDto getListStats();
}
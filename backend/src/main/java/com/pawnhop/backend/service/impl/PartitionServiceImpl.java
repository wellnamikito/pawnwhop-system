package com.pawnhop.backend.service.impl;

import com.pawnhop.backend.dto.response.LoanListResponseDto;
import com.pawnhop.backend.dto.response.LoanRangeResponseDto;
import com.pawnhop.backend.dto.response.PartitionOverviewDto;
import com.pawnhop.backend.dto.response.PartitionStatDto;
import com.pawnhop.backend.repository.LoanListRepo;
import com.pawnhop.backend.repository.LoanRangeRepo;
import com.pawnhop.backend.service.PartitionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PartitionServiceImpl
        implements PartitionService {

    private final LoanRangeRepo loanRangeRepo;

    private final LoanListRepo loanListRepo;


    @Override
    @Transactional(readOnly = true)
    public Page<LoanRangeResponseDto> getLoanRangePage(
            Pageable pageable
    ) {

        return loanRangeRepo
                .findAllWithPartition(pageable)
                .map(this::mapRange);
    }


    @Override
    @Transactional(readOnly = true)
    public List<LoanRangeResponseDto> getLoanRangeByDate(
            LocalDate from,
            LocalDate to
    ) {

        return loanRangeRepo
                .findByIssueDateBetween(from, to)
                .stream()
                .map(this::mapRange)
                .toList();
    }


    @Override
    @Transactional(readOnly = true)
    public Page<LoanListResponseDto> getLoanListPage(
            Pageable pageable
    ) {

        return loanListRepo
                .findAllWithPartition(pageable)
                .map(this::mapList);
    }


    @Override
    @Transactional(readOnly = true)
    public List<LoanListResponseDto> getLoanListByGroup(
            Integer group
    ) {

        return loanListRepo
                .findByPawnshopGroup(group)
                .stream()
                .map(this::mapList)
                .toList();
    }


    @Override
    @Transactional(readOnly = true)
    public PartitionOverviewDto getRangeStats() {

        List<PartitionStatDto> stats =
                loanRangeRepo
                        .getPartitionStats()
                        .stream()
                        .map(row ->
                                new PartitionStatDto(
                                        String.valueOf(row[0]),
                                        ((Number) row[1]).longValue()
                                )
                        )
                        .toList();

        return new PartitionOverviewDto(
                "loan_range",
                "RANGE",
                stats
        );
    }


    @Override
    @Transactional(readOnly = true)
    public PartitionOverviewDto getListStats() {

        List<PartitionStatDto> stats =
                loanListRepo
                        .getPartitionStats()
                        .stream()
                        .map(row ->
                                new PartitionStatDto(
                                        String.valueOf(row[0]),
                                        ((Number) row[1]).longValue()
                                )
                        )
                        .toList();

        return new PartitionOverviewDto(
                "loan_list",
                "LIST",
                stats
        );
    }


    private LoanRangeResponseDto mapRange(
            Object[] row
    ) {

        return new LoanRangeResponseDto(
                ((Number) row[0]).intValue(),

                ((Number) row[2]).intValue(),

                ((Number) row[3]).intValue(),

                row[4] == null
                        ? null
                        : (BigDecimal) row[4],

                toLocalDate(row[1]),

                toLocalDate(row[5]),

                row[6] == null
                        ? null
                        : (BigDecimal) row[6],

                row[7] == null
                        ? null
                        : (Boolean) row[7],

                String.valueOf(row[8])
        );
    }


    private LoanListResponseDto mapList(
            Object[] row
    ) {

        return new LoanListResponseDto(
                ((Number) row[0]).intValue(),

                ((Number) row[2]).intValue(),

                ((Number) row[3]).intValue(),

                row[4] == null
                        ? null
                        : (BigDecimal) row[4],

                toLocalDate(row[5]),

                toLocalDate(row[6]),

                row[7] == null
                        ? null
                        : (BigDecimal) row[7],

                row[8] == null
                        ? null
                        : (Boolean) row[8],

                ((Number) row[1]).intValue(),

                String.valueOf(row[9])
        );
    }


    private LocalDate toLocalDate(
            Object value
    ) {

        if (value == null) {
            return null;
        }

        if (value instanceof LocalDate localDate) {
            return localDate;
        }

        if (value instanceof Date sqlDate) {
            return sqlDate.toLocalDate();
        }

        return LocalDate.parse(
                value.toString()
        );
    }
}
package com.pawnhop.backend.controller;

import com.pawnhop.backend.dto.response.LoanListResponseDto;
import com.pawnhop.backend.dto.response.LoanRangeResponseDto;
import com.pawnhop.backend.dto.response.PartitionOverviewDto;
import com.pawnhop.backend.service.PartitionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/partitions")
@RequiredArgsConstructor
public class PartitionController {

    private final PartitionService partitionService;


    /**
     * RANGE partitioning.
     *
     * GET /api/partitions/range
     */
    @GetMapping("/range")
    public Page<LoanRangeResponseDto> getRange(
            @PageableDefault(
                    size = 50,
                    sort = "issueDate"
            )
            Pageable pageable
    ) {

        return partitionService
                .getLoanRangePage(pageable);
    }


    /**
     * RANGE partitioning с фильтром
     * по ключу разбиения.
     *
     * Например:
     *
     * /api/partitions/range/by-date
     * ?from=2023-07-01
     * &to=2023-09-30
     */
    @GetMapping("/range/by-date")
    public List<LoanRangeResponseDto> getRangeByDate(
            @RequestParam LocalDate from,
            @RequestParam LocalDate to
    ) {

        return partitionService
                .getLoanRangeByDate(
                        from,
                        to
                );
    }


    /**
     * LIST partitioning.
     *
     * GET /api/partitions/list
     */
    @GetMapping("/list")
    public Page<LoanListResponseDto> getList(
            @PageableDefault(
                    size = 50,
                    sort = "issueDate"
            )
            Pageable pageable
    ) {

        return partitionService
                .getLoanListPage(pageable);
    }


    /**
     * LIST partitioning с фильтром
     * по ключу разбиения.
     *
     * /api/partitions/list/by-group?group=2
     */
    @GetMapping("/list/by-group")
    public List<LoanListResponseDto> getListByGroup(
            @RequestParam Integer group
    ) {

        return partitionService
                .getLoanListByGroup(group);
    }


    /**
     * Статистика RANGE-секций.
     */
    @GetMapping("/range/stats")
    public PartitionOverviewDto getRangeStats() {

        return partitionService
                .getRangeStats();
    }


    /**
     * Статистика LIST-секций.
     */
    @GetMapping("/list/stats")
    public PartitionOverviewDto getListStats() {

        return partitionService
                .getListStats();
    }
}
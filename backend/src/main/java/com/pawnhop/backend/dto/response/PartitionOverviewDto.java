package com.pawnhop.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@AllArgsConstructor
@Getter
@Setter
public class PartitionOverviewDto {

    private String table;

    private String partitioningType;

    private List<PartitionStatDto> partitions;
}
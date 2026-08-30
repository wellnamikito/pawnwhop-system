package com.pawnhop.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class PartitionStatDto {

    private String partition;

    private Long rows;
}
package com.pawnhop.backend.service;

import com.pawnhop.backend.dto.request.PawnshopRequestDto;
import com.pawnhop.backend.dto.response.PawnshopResponseDto;

import java.util.List;

public interface PawnshopService {

    List<PawnshopResponseDto> getAllPawnshops();

    PawnshopResponseDto getPawnshopById(Integer id);

    PawnshopResponseDto createPawnshop(PawnshopRequestDto dto);

    PawnshopResponseDto updatePawnshop(Integer id, PawnshopRequestDto dto);

    void deletePawnshop(Integer id);
}

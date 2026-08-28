package com.pawnhop.backend.service;

import com.pawnhop.backend.dto.request.PawnshopRequestDto;
import com.pawnhop.backend.dto.response.PawnshopResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PawnshopService {

    List<PawnshopResponseDto> getAllPawnshops();

    Page<PawnshopResponseDto> getPawnshopsPage(String search, Pageable pageable);

    PawnshopResponseDto createPawnshop(PawnshopRequestDto dto);

    PawnshopResponseDto updatePawnshop(Integer id, PawnshopRequestDto dto);

    void deletePawnshop(Integer id);
}

package com.pawnhop.backend.controller;


import com.pawnhop.backend.dto.request.PawnshopRequestDto;
import com.pawnhop.backend.dto.response.PawnshopResponseDto;
import com.pawnhop.backend.service.PawnshopService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pawnshops")
@RequiredArgsConstructor
public class PawnshopController {

    private final PawnshopService pawnshopService;

    // GET /api/pawnshops
    @GetMapping
    public List<PawnshopResponseDto> getAllPawnshops(){

        return pawnshopService.getAllPawnshops();
    }

    // GET /api/pawnshops/page
    @GetMapping("/page")
    public Page<PawnshopResponseDto> getPawnshopsById(
            @PageableDefault(size = 50, sort = "pawnshopId")
            Pageable pageable
    ){

        return pawnshopService.getPawnshopsPage(pageable);
    }

    // POST /api/pawnshops
    @PostMapping
    public PawnshopResponseDto createPawnshop(
            @Valid @RequestBody PawnshopRequestDto dto
    ){

        return pawnshopService.createPawnshop(dto);
    }

    // PUT /api/pawnshops/{id}
    @PutMapping("/{id}")
    public PawnshopResponseDto updatePawnshop(
            @PathVariable Integer id,
            @Valid @RequestBody PawnshopRequestDto dto
    ){

        return pawnshopService.updatePawnshop(id,dto);
    }

    // DELETE /api/pawnshops/{id}
    @DeleteMapping("{id}")
    public void deletePawnshop(
            @PathVariable Integer id
    ){

        pawnshopService.deletePawnshop(id);
    }
}

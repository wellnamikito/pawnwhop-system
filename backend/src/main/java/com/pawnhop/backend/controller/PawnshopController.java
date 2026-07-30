package com.pawnhop.backend.controller;


import com.pawnhop.backend.dto.request.PawnshopRequestDto;
import com.pawnhop.backend.dto.response.PawnshopResponseDto;
import com.pawnhop.backend.service.PawnshopService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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

    // GET /api/pawnshops/{id}
    @GetMapping("/{id}")
    public PawnshopResponseDto getPawnshopsById(
            @PathVariable Integer id
    ){

        return pawnshopService.getPawnshopById(id);
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

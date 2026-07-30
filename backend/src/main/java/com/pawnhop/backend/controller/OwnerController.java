package com.pawnhop.backend.controller;

import com.pawnhop.backend.dto.request.OwnerRequestDto;
import com.pawnhop.backend.dto.response.OwnerResponseDto;
import com.pawnhop.backend.service.OwnerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/owners")
@RequiredArgsConstructor
public class OwnerController {

    private final OwnerService ownerService;

    // GET /api/owners
    @GetMapping
    public List<OwnerResponseDto> getAllOwners(){

        return ownerService.getAllOwners();
    }

    // GET /api/owners/{id}
    @GetMapping("/{id}")
    public OwnerResponseDto getOwnerById(
            @PathVariable Integer id
    ){

        return ownerService.getOwnerById(id);
    }

    // POST /api/owners
    @PostMapping
    public OwnerResponseDto createOwner(
            @Valid @RequestBody OwnerRequestDto dto
    ){

        return ownerService.createOwner(dto);
    }

    // PUT /api/owners/{id}
    @PutMapping("/{id}")
    public OwnerResponseDto updateClient(
            @PathVariable Integer id,
            @Valid @RequestBody OwnerRequestDto dto
    ){

        return ownerService.updateOwner(id,dto);
    }

    // DELETE /api/owners/{id}
    @DeleteMapping("/{id}")
    public void deleteOwner(
            @PathVariable Integer id
    ){

        ownerService.deleteOwner(id);
    }
}

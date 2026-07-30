package com.pawnhop.backend.controller;

import com.pawnhop.backend.dto.request.DictionaryRequestDto;
import com.pawnhop.backend.dto.response.DictionaryResponseDto;
import com.pawnhop.backend.service.OwnershipTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ownership-types")
@RequiredArgsConstructor
public class OwnershipTypeController {

    private final OwnershipTypeService ownershipTypeService;

    // GET /api/ownership-types
    @GetMapping
    public List<DictionaryResponseDto> getAllOwnershipTypes(){

        return ownershipTypeService.getAllOwhershipTypes();
    }

    // GET /api/ownership-types/{id}
    @GetMapping("/{id}")
    public DictionaryResponseDto getOwnershipTypeById(
            @PathVariable Integer id
    ){

        return ownershipTypeService.getOwhershipTypeById(id);
    }

    // POST /api/ownership-types
    @PostMapping
    public DictionaryResponseDto createOwnershipType(
            @Valid @RequestBody DictionaryRequestDto dto
    ){

        return ownershipTypeService.createOwhershipType(dto);
    }

    // PUT /api/ownership-types/{id}
    @PutMapping("/{id}")
    public DictionaryResponseDto updateOwnershipType(
            @PathVariable Integer id,
            @Valid @RequestBody DictionaryRequestDto dto
    ){

        return ownershipTypeService.updateOwhershipType(id, dto);
    }

    // DELETE /api/ownership-types/{id}
    @DeleteMapping("/{id}")
    public void deleteOwnershipType(
            @PathVariable Integer id
    ){
        ownershipTypeService.deleteOwhershipType(id);
    }
}

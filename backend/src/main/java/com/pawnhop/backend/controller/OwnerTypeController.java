package com.pawnhop.backend.controller;

import com.pawnhop.backend.dto.request.DictionaryRequestDto;
import com.pawnhop.backend.dto.response.DictionaryResponseDto;
import com.pawnhop.backend.service.OwnerTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/owner-types")
@RequiredArgsConstructor
public class OwnerTypeController {

    private final OwnerTypeService ownerTypeService;

    // GET /api/owner-types
    @GetMapping
    public List<DictionaryResponseDto> getAllOwnerTypes(){

        return  ownerTypeService.getAllOwnerTypes();
    }

    // GET /api/owner-types/{id}
    @GetMapping("/{id}")
    public DictionaryResponseDto getOwnerTypeById(
            @PathVariable Integer id
    ){
        return ownerTypeService.getOwnerTypeById(id);
    }

    // POST /api/owner-types
    @PostMapping
    public DictionaryResponseDto createOwnerType(
            @Valid @RequestBody DictionaryRequestDto dto
    ){

        return ownerTypeService.createOwnerType(dto);
    }

    // PUT /api/owner-type/{id}
    @PutMapping("/{id}")
    public DictionaryResponseDto updateOwnerType(
            @PathVariable Integer id,
            @Valid @RequestBody DictionaryRequestDto dto
    ){

        return ownerTypeService.updateOwnerType(id, dto);
    }

    // DELETE /api/owner-type/{id}
    @DeleteMapping("/{id}")
    public void deleteOwnershipType(
            @PathVariable Integer id
    ){
        ownerTypeService.deleteOwnerType(id);
    }
}

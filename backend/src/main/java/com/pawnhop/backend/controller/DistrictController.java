package com.pawnhop.backend.controller;

import com.pawnhop.backend.dto.request.DictionaryRequestDto;
import com.pawnhop.backend.dto.response.DictionaryResponseDto;
import com.pawnhop.backend.service.DistrictService;
import com.pawnhop.backend.service.OwnershipTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/districts")
@RequiredArgsConstructor
public class DistrictController {

    private final DistrictService districtService;

    // GET /api/districts
    @GetMapping
    public List<DictionaryResponseDto> getAllDistrictes(){

        return districtService.getAllDistrict();
    }

    // GET /api/districts/{id}
    @GetMapping("/{id}")
    public DictionaryResponseDto getDistrictById(
            @PathVariable Integer id
    ){

        return districtService.getDistrictById(id);
    }

    // POST /api/districts
    @PostMapping
    public DictionaryResponseDto createDistrict(
            @Valid @RequestBody DictionaryRequestDto dto
    ){

        return districtService.createDistrict(dto);
    }

    // PUT /api/districts/{id}
    @PutMapping("/{id}")
    public DictionaryResponseDto updateSocialStatus(
            @PathVariable Integer id,
            @Valid @RequestBody DictionaryRequestDto dto
    ){

        return districtService.updateSocialStatus(id, dto);
    }

    // DELETE /api/districts/{id}
    @DeleteMapping("/{id}")
    public void ddeleteDistric(
            @PathVariable Integer id
    ){
        districtService.deleteDistrict(id);
    }
}

package com.pawnhop.backend.controller;

import com.pawnhop.backend.dto.request.DictionaryRequestDto;
import com.pawnhop.backend.dto.response.DictionaryResponseDto;
import com.pawnhop.backend.service.PledgeItemTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pledge-item-types")
@RequiredArgsConstructor
public class PledgeItemTypeController {

    private final PledgeItemTypeService pledgeItemTypeService;

    // GET /api/pledge-item-types
    @GetMapping
    public List<DictionaryResponseDto> getAllPledgeItemTypes(){

        return  pledgeItemTypeService.getAllPledgeItemTypes();
    }

    // GET /api/pledge-item-types
    @GetMapping("/{id}")
    public DictionaryResponseDto getPledgeItemTypeById(
            @PathVariable Integer id
    ){

        return pledgeItemTypeService.getPledgeItemTypeById(id);
    }

    // POST /api/pledge-item-types
    @PostMapping
    public DictionaryResponseDto createPledgeItemType(
            @Valid @RequestBody DictionaryRequestDto dto
    ){

        return pledgeItemTypeService.createPledgeItemType(dto);
    }

    // PUT /api/pledge-item-types/{id}
    @PutMapping("/{id}")
    public DictionaryResponseDto updatePledgeItemType(
            @PathVariable Integer id,
            @Valid @RequestBody DictionaryRequestDto dto
    ){

        return pledgeItemTypeService.updatePledgeItemType(id, dto);
    }

    // DELETE /api/pledge-item-types/{id}
    @DeleteMapping("/{id}")
    public void deletePledgeItemType(
            @PathVariable Integer id
    ){

        pledgeItemTypeService.deletePledgeItemType(id);
    }
}

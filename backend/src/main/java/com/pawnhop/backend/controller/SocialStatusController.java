package com.pawnhop.backend.controller;

import com.pawnhop.backend.dto.request.DictionaryRequestDto;
import com.pawnhop.backend.dto.response.DictionaryResponseDto;
import com.pawnhop.backend.service.SocialStatusService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/social-statuses")
@RequiredArgsConstructor
public class SocialStatusController {

    private final SocialStatusService socialStatusService;

    // GET /api/socil-statuses
    @GetMapping
    public List<DictionaryResponseDto> getAllSocialStatus(){

        return socialStatusService.getAllSocialStatus();
    }

    // GET /api/social-statuses/{id}
    @GetMapping("/{id}")
    public DictionaryResponseDto getSocialStatusById(
            @PathVariable Integer id
    ){

        return  socialStatusService.getSocialStatusById(id);
    }

    // POST /api/social-statuses
    @PostMapping
    public DictionaryResponseDto createSocialStatus(
            @Valid @RequestBody DictionaryRequestDto dto
    ){

        return socialStatusService.createSocialStatus(dto);
    }

    // PUT /api/social-statuses/{id}
    @PutMapping("/{id}")
    public DictionaryResponseDto updateSocialStatus(
            @PathVariable Integer id,
            @Valid @RequestBody DictionaryRequestDto dto
    ){

        return socialStatusService.updateSocialStatus(id, dto);
    }

    // DELETE /api/social-status/{id}
    @DeleteMapping("/{id}")
    public void deleteSocialStatus(
            @PathVariable Integer id
    ){
        socialStatusService.deleteSocialStatus(id);
    }
}

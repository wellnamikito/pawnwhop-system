package com.pawnhop.backend.service.impl;

import com.pawnhop.backend.dto.request.DictionaryRequestDto;
import com.pawnhop.backend.dto.response.DictionaryResponseDto;
import com.pawnhop.backend.entity.SocialStatus;
import com.pawnhop.backend.repository.SocialStatusRepo;
import com.pawnhop.backend.service.SocialStatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SocialStatusServiceImpl implements SocialStatusService {

    private final SocialStatusRepo socialStatusRepo;

    @Override
    @Transactional(readOnly = true)
    public List<DictionaryResponseDto> getAllSocialStatus(){

        return  socialStatusRepo.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DictionaryResponseDto getSocialStatusById(Integer id){

        SocialStatus socialStatus = socialStatusRepo.findById(id)
                .orElseThrow(() ->
                  new RuntimeException("Социальный статус не найден: " + id)
                );

        return mapToResponse(socialStatus);
    }

    @Override
    @Transactional
    public DictionaryResponseDto createSocialStatus(DictionaryRequestDto dto){

        SocialStatus socialStatus = new SocialStatus();

        socialStatus.setStatusName(dto.getName());

        SocialStatus savedSocialStatus = socialStatusRepo.save(socialStatus);

        return mapToResponse(savedSocialStatus);
    }

    @Override
    @Transactional
    public DictionaryResponseDto updateSocialStatus(Integer id, DictionaryRequestDto dto){

        SocialStatus socialStatus = socialStatusRepo
                .findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Социальный статус не найден")
                );

        socialStatus.setStatusName(dto.getName());

        return mapToResponse(socialStatus);
    }

    @Override
    @Transactional
    public void deleteSocialStatus(Integer id){

        if(!socialStatusRepo.existsById(id)) {throw  new RuntimeException("Социальный статус не найден");}

        socialStatusRepo.deleteById(id);
    }

    private DictionaryResponseDto mapToResponse(SocialStatus socialStatus){

        return new  DictionaryResponseDto(

                socialStatus.getSocialStatusId(),

                socialStatus.getStatusName()
        );
    }
}

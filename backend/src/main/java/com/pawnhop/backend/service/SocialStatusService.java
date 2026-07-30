package com.pawnhop.backend.service;



import com.pawnhop.backend.dto.request.DictionaryRequestDto;
import com.pawnhop.backend.dto.response.DictionaryResponseDto;

import java.util.List;

public interface SocialStatusService {

    List<DictionaryResponseDto> getAllSocialStatus();

    DictionaryResponseDto getSocialStatusById(Integer id);

    DictionaryResponseDto createSocialStatus(DictionaryRequestDto dto);

    DictionaryResponseDto updateSocialStatus(Integer id, DictionaryRequestDto dto);

    void deleteSocialStatus(Integer id);
}

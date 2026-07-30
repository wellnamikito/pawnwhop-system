package com.pawnhop.backend.service;

import com.pawnhop.backend.dto.request.DictionaryRequestDto;
import com.pawnhop.backend.dto.response.DictionaryResponseDto;

import java.util.List;

public interface DistrictService {

    List<DictionaryResponseDto> getAllDistrict();

    DictionaryResponseDto getDistrictById(Integer id);

    DictionaryResponseDto createDistrict(DictionaryRequestDto dto);

    DictionaryResponseDto updateSocialStatus(Integer id, DictionaryRequestDto dto);

    void deleteDistrict(Integer id);
}

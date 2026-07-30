package com.pawnhop.backend.service;

import com.pawnhop.backend.dto.request.DictionaryRequestDto;
import com.pawnhop.backend.dto.response.DictionaryResponseDto;

import java.util.List;

public interface OwnerTypeService {

    List<DictionaryResponseDto> getAllOwnerTypes();

    DictionaryResponseDto getOwnerTypeById(Integer id);

    DictionaryResponseDto createOwnerType(DictionaryRequestDto dto);

    DictionaryResponseDto updateOwnerType(Integer id, DictionaryRequestDto dto);

    void deleteOwnerType(Integer id);
}

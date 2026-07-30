package com.pawnhop.backend.service;

import com.pawnhop.backend.dto.request.DictionaryRequestDto;
import com.pawnhop.backend.dto.response.DictionaryResponseDto;

import java.util.List;

public interface OwnershipTypeService {

    List<DictionaryResponseDto> getAllOwhershipTypes();

    DictionaryResponseDto getOwhershipTypeById(Integer id);

    DictionaryResponseDto createOwhershipType(DictionaryRequestDto dto);

    DictionaryResponseDto updateOwhershipType(Integer id, DictionaryRequestDto dto);

    void deleteOwhershipType(Integer id);
}

package com.pawnhop.backend.service;

import com.pawnhop.backend.dto.request.DictionaryRequestDto;
import com.pawnhop.backend.dto.response.DictionaryResponseDto;

import java.util.List;

public interface PledgeItemTypeService {

    List<DictionaryResponseDto> getAllPledgeItemTypes();

    DictionaryResponseDto getPledgeItemTypeById(Integer id);

    DictionaryResponseDto createPledgeItemType(DictionaryRequestDto dto);

    DictionaryResponseDto updatePledgeItemType(Integer id, DictionaryRequestDto dto);

    void deletePledgeItemType(Integer id);
}

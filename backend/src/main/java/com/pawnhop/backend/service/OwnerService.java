package com.pawnhop.backend.service;


import com.pawnhop.backend.dto.request.OwnerRequestDto;
import com.pawnhop.backend.dto.response.OwnerResponseDto;

import java.util.List;

public interface OwnerService {

    List<OwnerResponseDto> getAllOwners();

    OwnerResponseDto getOwnerById(Integer id);

    OwnerResponseDto createOwner(OwnerRequestDto dto);

    OwnerResponseDto updateOwner(Integer id, OwnerRequestDto dto);

    void deleteOwner(Integer id);
}

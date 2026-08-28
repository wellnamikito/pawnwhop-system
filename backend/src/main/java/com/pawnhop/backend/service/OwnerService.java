package com.pawnhop.backend.service;


import com.pawnhop.backend.dto.request.OwnerRequestDto;
import com.pawnhop.backend.dto.response.OwnerResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface OwnerService {

    List<OwnerResponseDto> getAllOwners();

    Page<OwnerResponseDto> getOwnersPage( String search, Pageable pageable);

    OwnerResponseDto createOwner(OwnerRequestDto dto);

    OwnerResponseDto updateOwner(Integer id, OwnerRequestDto dto);

    void deleteOwner(Integer id);
}

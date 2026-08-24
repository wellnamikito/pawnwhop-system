package com.pawnhop.backend.service.impl;

import com.pawnhop.backend.dto.request.OwnerRequestDto;
import com.pawnhop.backend.dto.response.OwnerResponseDto;
import com.pawnhop.backend.entity.Owner;
import com.pawnhop.backend.entity.OwnerType;
import com.pawnhop.backend.repository.OwnerRepo;
import com.pawnhop.backend.repository.OwnerTypeRepo;

import com.pawnhop.backend.service.OwnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OwnerServiceImpl implements OwnerService {

    private final OwnerRepo ownerRepo;

    private final OwnerTypeRepo ownerTypeRepo;

    @Override
    @Transactional(readOnly = true)
    public List<OwnerResponseDto> getAllOwners(){

        return ownerRepo.findAll()
                .stream()
                .map(this::mapPoResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OwnerResponseDto> getOwnersPage(Pageable pageable){

        return ownerRepo.findAll(pageable)
                .map(this::mapPoResponse);
    }

    @Override
    @Transactional
    public OwnerResponseDto createOwner(OwnerRequestDto dto){

        OwnerType ownerType = ownerTypeRepo
                .findById(dto.getOwnerTypeId())
                .orElseThrow(()->
                    new RuntimeException("Статус не найден")
                );

        Owner owner = new Owner();

        owner.setLastName(dto.getLastName());
        owner.setFirstName(dto.getFirstName());
        owner.setMiddleName(dto.getMiddleName());
        owner.setOwnerTypeId(ownerType);
        owner.setPhone(dto.getPhone());

        Owner savedOwner = ownerRepo.save(owner);

        return mapPoResponse(savedOwner);
    }

    @Override
    @Transactional
    public OwnerResponseDto updateOwner(Integer id, OwnerRequestDto dto){

        Owner owner = ownerRepo
                .findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Владелец не найден")
                );

        OwnerType ownerType = ownerTypeRepo
                .findById(dto.getOwnerTypeId())
                .orElseThrow(()->
                        new RuntimeException("Статус не найден")
                );

        owner.setLastName(dto.getLastName());
        owner.setFirstName(dto.getFirstName());
        owner.setMiddleName(dto.getMiddleName());
        owner.setOwnerTypeId(ownerType);
        owner.setPhone(dto.getPhone());

        return mapPoResponse(owner);
    }

    @Override
    @Transactional
    public void deleteOwner(Integer id){

        if(!ownerRepo.existsById(id)) { throw new RuntimeException("Владелец не найден.");}

        ownerRepo.deleteById(id);
    }

    private OwnerResponseDto mapPoResponse(Owner owner){

        return new OwnerResponseDto(

                owner.getOwnerId(),

                owner.getLastName(),

                owner.getFirstName(),

                owner.getMiddleName(),

                owner.getOwnerTypeId().getTypeName(),

                owner.getPhone()
        );
    }
}

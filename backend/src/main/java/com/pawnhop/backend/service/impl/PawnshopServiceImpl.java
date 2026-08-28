package com.pawnhop.backend.service.impl;


import com.pawnhop.backend.dto.request.PawnshopRequestDto;
import com.pawnhop.backend.dto.response.PawnshopResponseDto;
import com.pawnhop.backend.entity.District;
import com.pawnhop.backend.entity.Owner;
import com.pawnhop.backend.entity.OwnershipType;
import com.pawnhop.backend.entity.Pawnshop;
import com.pawnhop.backend.repository.DistrictRepo;
import com.pawnhop.backend.repository.OwnerRepo;
import com.pawnhop.backend.repository.OwnershipTypeRepo;
import com.pawnhop.backend.repository.PawnshopRepo;
import com.pawnhop.backend.service.PawnshopService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PawnshopServiceImpl implements PawnshopService {

    private final PawnshopRepo pawnshopRepo;

    private final OwnershipTypeRepo ownershipTypeRepo;

    private final OwnerRepo ownerRepo;

    private final DistrictRepo districtRepo;

    @Override
    @Transactional(readOnly = true)
    public List<PawnshopResponseDto> getAllPawnshops(){

        return pawnshopRepo.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PawnshopResponseDto> getPawnshopsPage(String search, Pageable pageable){

        if (search == null || search.isBlank()) {
            return pawnshopRepo.findAll(pageable)
                    .map(this::mapToResponse);
        }

        return pawnshopRepo.search(search.trim(), pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional
    public PawnshopResponseDto createPawnshop(PawnshopRequestDto dto){

        OwnershipType ownershipType = ownershipTypeRepo
                .findById(dto.getOwnershipTypeId())
                .orElseThrow(() ->
                    new RuntimeException("Тип собственности не найден")
                );

        Owner owner = ownerRepo
                .findById(dto.getOwnerId())
                .orElseThrow(() ->
                        new RuntimeException("Владелец не найден")
                );

        District district = districtRepo
                .findById(dto.getDistrictId())
                .orElseThrow(() ->
                        new RuntimeException("Район не найден")
                );

        Pawnshop pawnshop = new Pawnshop();

        pawnshop.setName(dto.getName());
        pawnshop.setOwnershipTypeId(ownershipType);
        pawnshop.setOwnerId(owner);
        pawnshop.setDistrictId(district);
        pawnshop.setAddress(dto.getAddress());
        pawnshop.setPhone(dto.getPhone());
        pawnshop.setOpeningHour(dto.getOpeningHour());
        pawnshop.setClosingHour(dto.getClosingHour());

        Pawnshop savedPawnshop = pawnshopRepo.save(pawnshop);

        return mapToResponse((savedPawnshop));
    }

    @Override
    @Transactional
    public PawnshopResponseDto updatePawnshop(Integer id, PawnshopRequestDto dto){

        Pawnshop pawnshop = pawnshopRepo
                .findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Ломбард не найден")
                );

        OwnershipType ownershipType = ownershipTypeRepo
                .findById(dto.getOwnershipTypeId())
                .orElseThrow(() ->
                        new RuntimeException("Тип собственности не найден")
                );

        Owner owner = ownerRepo
                .findById(dto.getOwnerId())
                .orElseThrow(() ->
                        new RuntimeException("Владелец не найден")
                );

        District district = districtRepo
                .findById(dto.getDistrictId())
                .orElseThrow(() ->
                        new RuntimeException("Район не найден")
                );

        pawnshop.setName(dto.getName());
        pawnshop.setOwnershipTypeId(ownershipType);
        pawnshop.setOwnerId(owner);
        pawnshop.setDistrictId(district);
        pawnshop.setAddress(dto.getAddress());
        pawnshop.setPhone(dto.getPhone());
        pawnshop.setOpeningHour(dto.getOpeningHour());
        pawnshop.setClosingHour(dto.getClosingHour());

        return mapToResponse(pawnshop);
    }

    @Override
    @Transactional
    public void deletePawnshop(Integer id){

        if(!pawnshopRepo.existsById(id)){
            throw new RuntimeException("Ломбард не найден");
        }

        pawnshopRepo.deleteById(id);
    }

    private PawnshopResponseDto mapToResponse(Pawnshop pawnshop){

        return new PawnshopResponseDto(

                pawnshop.getPawnshopId(),

                pawnshop.getName(),

                pawnshop.getOwnershipTypeId().getTypeName(),

                pawnshop.getOwnerId().getLastName()
                + " " + pawnshop.getOwnerId().getFirstName()
                + " " + pawnshop.getOwnerId().getMiddleName(),

                pawnshop.getDistrictId().getDistrictName(),

                pawnshop.getAddress(),

                pawnshop.getPhone(),

                pawnshop.getOpeningHour(),

                pawnshop.getClosingHour()
        );
    }
}

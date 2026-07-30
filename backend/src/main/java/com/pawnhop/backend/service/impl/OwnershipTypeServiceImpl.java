package com.pawnhop.backend.service.impl;

import com.pawnhop.backend.dto.request.DictionaryRequestDto;
import com.pawnhop.backend.dto.response.DictionaryResponseDto;
import com.pawnhop.backend.entity.OwnershipType;
import com.pawnhop.backend.repository.OwnershipTypeRepo;
import com.pawnhop.backend.service.OwhershipTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
@Service
@RequiredArgsConstructor
public class OwnershipTypeServiceImpl implements OwhershipTypeService {

    private final OwnershipTypeRepo ownershipTypeRepo;

    @Override
    @Transactional(readOnly = true)
    public List<DictionaryResponseDto> getAllOwhershipTypes(){

        return  ownershipTypeRepo.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DictionaryResponseDto getOwhershipTypeById(Integer id){

        OwnershipType ownershipType = ownershipTypeRepo.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Вид собственности не найден: " + id)
                );

        return mapToResponse(ownershipType);
    }

    @Override
    @Transactional
    public DictionaryResponseDto createOwhershipType(DictionaryRequestDto dto){

        OwnershipType ownershipType = new OwnershipType();

        ownershipType.setTypeName(dto.getName());

        OwnershipType savedOwnershipType = ownershipTypeRepo.save(ownershipType);

        return mapToResponse(savedOwnershipType);
    }

    @Override
    @Transactional
    public DictionaryResponseDto updateOwhershipType(Integer id, DictionaryRequestDto dto){

        OwnershipType ownershipType = ownershipTypeRepo.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Вид собственности не найден")
                );

        ownershipType.setTypeName(dto.getName());

        return mapToResponse(ownershipType);
    }

    @Override
    @Transactional
    public void deleteOwhershipType(Integer id){

        if(!ownershipTypeRepo.existsById(id)){
            throw new RuntimeException("Вид собственности не найден");
        }
        ownershipTypeRepo.deleteById(id);
    }

    private DictionaryResponseDto mapToResponse(OwnershipType ownershipType){

        return new DictionaryResponseDto(

                ownershipType.getOwnershipTypeId(),

                ownershipType.getTypeName()
        );
    }
}

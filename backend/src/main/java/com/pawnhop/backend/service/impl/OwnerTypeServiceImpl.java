package com.pawnhop.backend.service.impl;

import com.pawnhop.backend.dto.request.DictionaryRequestDto;
import com.pawnhop.backend.dto.response.DictionaryResponseDto;
import com.pawnhop.backend.entity.OwnerType;
import com.pawnhop.backend.repository.OwnerTypeRepo;
import com.pawnhop.backend.service.OwnerTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OwnerTypeServiceImpl implements OwnerTypeService {

    private final OwnerTypeRepo ownerTypeRepo;

    @Override
    @Transactional(readOnly = true)
    public List<DictionaryResponseDto> getAllOwnerTypes(){

        return  ownerTypeRepo.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DictionaryResponseDto getOwnerTypeById(Integer id){

        OwnerType ownerType = ownerTypeRepo.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Тип владельца не найден: " + id)
                );

        return mapToResponse(ownerType);
    }

    @Override
    @Transactional
    public DictionaryResponseDto createOwnerType(DictionaryRequestDto dto){

        OwnerType ownerType = new OwnerType();

        ownerType.setTypeName(dto.getName());

        OwnerType savedOwnerType = ownerTypeRepo.save(ownerType);

        return mapToResponse(savedOwnerType);
    }

    @Override
    @Transactional
    public DictionaryResponseDto updateOwnerType(Integer id, DictionaryRequestDto dto){

        OwnerType ownerType = ownerTypeRepo.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Тип владельца не найден")
                );

        ownerType.setTypeName(dto.getName());

        return mapToResponse(ownerType);
    }

    @Override
    @Transactional
    public void deleteOwnerType(Integer id){

        if(!ownerTypeRepo.existsById(id)){
            throw  new RuntimeException("Тип владельца не найден");
        }

        ownerTypeRepo.deleteById(id);
    }

    private DictionaryResponseDto mapToResponse(OwnerType ownerType){

        return new DictionaryResponseDto(

                ownerType.getOwnerTypeId(),

                ownerType.getTypeName()
        );
    }
}

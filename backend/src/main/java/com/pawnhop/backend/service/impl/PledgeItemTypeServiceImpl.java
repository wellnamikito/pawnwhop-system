package com.pawnhop.backend.service.impl;

import com.pawnhop.backend.dto.request.DictionaryRequestDto;
import com.pawnhop.backend.dto.response.DictionaryResponseDto;
import com.pawnhop.backend.entity.PledgeItemType;
import com.pawnhop.backend.repository.PledgeItemTypeRepo;
import com.pawnhop.backend.service.PledgeItemTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PledgeItemTypeServiceImpl implements PledgeItemTypeService {

    private final PledgeItemTypeRepo pledgeItemTypeRepo;

    @Override
    @Transactional(readOnly = true)
    public List<DictionaryResponseDto> getAllPledgeItemTypes(){

        return pledgeItemTypeRepo.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DictionaryResponseDto getPledgeItemTypeById(Integer id){

        PledgeItemType pledgeItemType = pledgeItemTypeRepo.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Тип предмета залога не найден: " + id)
                );

        return mapToResponse(pledgeItemType);
    }

    @Override
    @Transactional
    public DictionaryResponseDto createPledgeItemType(DictionaryRequestDto dto){

        PledgeItemType pledgeItemType = new PledgeItemType();

        pledgeItemType.setTypeName(dto.getName());

        PledgeItemType savedPledgeItemType = pledgeItemTypeRepo.save(pledgeItemType);

        return mapToResponse(savedPledgeItemType);
    }

    @Override
    @Transactional
    public DictionaryResponseDto updatePledgeItemType(Integer id, DictionaryRequestDto dto){

        PledgeItemType pledgeItemType = pledgeItemTypeRepo.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Тип предмета залога не найден")
                );

        pledgeItemType.setTypeName(dto.getName());

        return mapToResponse(pledgeItemType);
    }

    @Override
    @Transactional
    public void deletePledgeItemType(Integer id){

        if(!pledgeItemTypeRepo.existsById(id)){
            throw  new RuntimeException("Тип предмета залога не найден");
        }

        pledgeItemTypeRepo.deleteById(id);
    }

    private DictionaryResponseDto mapToResponse(PledgeItemType pledgeItemType){

        return new DictionaryResponseDto(

                pledgeItemType.getItemTypeId(),

                pledgeItemType.getTypeName()
        );
    }
}

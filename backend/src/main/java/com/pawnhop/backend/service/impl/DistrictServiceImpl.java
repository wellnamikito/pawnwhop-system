package com.pawnhop.backend.service.impl;

import com.pawnhop.backend.dto.request.DictionaryRequestDto;
import com.pawnhop.backend.dto.response.DictionaryResponseDto;
import com.pawnhop.backend.entity.District;
import com.pawnhop.backend.repository.DistrictRepo;
import com.pawnhop.backend.service.DistrictService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DistrictServiceImpl implements DistrictService {

    private final DistrictRepo districtRepo;

    @Override
    @Transactional(readOnly = true)
    public List<DictionaryResponseDto> getAllDistrict(){

        return districtRepo.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DictionaryResponseDto getDistrictById(Integer id){

        District district = districtRepo.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Район не найдён: " + id)
                );

        return mapToResponse(district);
    }

    @Override
    @Transactional
    public DictionaryResponseDto createDistrict(DictionaryRequestDto dto){

        District district = new District();

        district.setDistrictName(dto.getName());

        District savedDistrict = districtRepo.save(district);

        return mapToResponse(savedDistrict);
    }

    @Override
    @Transactional
    public DictionaryResponseDto updateSocialStatus(Integer id, DictionaryRequestDto dto){

        District district = districtRepo
                .findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Район не найден")
                );

        district.setDistrictName(dto.getName());

        return mapToResponse(district);
    }

    @Override
    @Transactional
    public void deleteDistrict(Integer id){

        if(!districtRepo.existsById(id)){
            new RuntimeException("Район не найден");
        }

        districtRepo.deleteById(id);
    }

    private DictionaryResponseDto mapToResponse(District district){

        return new DictionaryResponseDto(

                district.getDistrictId(),

                district.getDistrictName()
        );
    }
}

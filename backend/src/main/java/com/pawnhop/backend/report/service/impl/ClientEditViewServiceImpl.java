package com.pawnhop.backend.report.service.impl;

import com.pawnhop.backend.report.dto.ClientEditViewDto;
import com.pawnhop.backend.report.repository.ClientEditViewRepository;
import com.pawnhop.backend.report.service.ClientEditViewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClientEditViewServiceImpl implements ClientEditViewService  {

    private final ClientEditViewRepository clientEditViewRepository;

    @Override
    public Page<ClientEditViewDto> getClientsFromEditView(Pageable pageable) {
       return clientEditViewRepository.findAll(pageable);
    }

    @Override
    public void updateClientThroughEditView(ClientEditViewDto dto) throws IllegalAccessException {

        if(dto.clientId() == null){
            throw new IllegalAccessException("ID клиента не найден");
        }

        clientEditViewRepository.update(dto);
    }
}

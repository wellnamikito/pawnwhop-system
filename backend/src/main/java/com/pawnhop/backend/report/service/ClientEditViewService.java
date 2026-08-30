package com.pawnhop.backend.report.service;

import com.pawnhop.backend.report.dto.ClientEditViewDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ClientEditViewService {

    Page<ClientEditViewDto> getClientsFromEditView(Pageable pageable);

    void updateClientThroughEditView(ClientEditViewDto dto) throws IllegalAccessException;
}

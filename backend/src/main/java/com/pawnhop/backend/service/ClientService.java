package com.pawnhop.backend.service;

import com.pawnhop.backend.dto.request.ClientRequestDto;
import com.pawnhop.backend.dto.response.ClientResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ClientService {

    List<ClientResponseDto> getAllClients();

    Page<ClientResponseDto> getClientsPage(Pageable pageable);

    ClientResponseDto createClient(ClientRequestDto dto);

    ClientResponseDto updateClient(Integer id, ClientRequestDto dto);

    void deleteClient(Integer id);
}

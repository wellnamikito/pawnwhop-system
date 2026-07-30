package com.pawnhop.backend.service;

import com.pawnhop.backend.dto.request.ClientRequestDto;
import com.pawnhop.backend.dto.response.ClientResponseDto;

import java.util.List;

public interface ClientService {

    List<ClientResponseDto> getAllClients();

    ClientResponseDto getClientById(Integer id);

    ClientResponseDto createClient(ClientRequestDto dto);

    ClientResponseDto updateClient(Integer id, ClientRequestDto dto);

    void deleteClient(Integer id);
}

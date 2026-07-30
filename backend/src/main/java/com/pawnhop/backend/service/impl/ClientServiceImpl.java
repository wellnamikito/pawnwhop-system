package com.pawnhop.backend.service.impl;

import com.pawnhop.backend.dto.request.ClientRequestDto;
import com.pawnhop.backend.dto.response.ClientResponseDto;
import com.pawnhop.backend.entity.Client;
import com.pawnhop.backend.repository.ClientRepo;
import com.pawnhop.backend.repository.SocialStatusRepo;
import com.pawnhop.backend.service.ClientService;
import com.pawnhop.backend.entity.SocialStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClientServiceImpl implements ClientService {

    private final ClientRepo clientRepo;

    private final SocialStatusRepo socialStatusRepo;

    @Override
    @Transactional(readOnly = true)
    public List<ClientResponseDto> getAllClients(){

        return clientRepo.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ClientResponseDto getClientById(Integer id){

        Client client = clientRepo.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Клиент не найден" + id)
                        );

        return mapToResponse(client);
    }

    @Override
    @Transactional
    public ClientResponseDto createClient(ClientRequestDto dto){

        SocialStatus socialStatus = socialStatusRepo
                .findById(dto.getSocialStatusId())
                .orElseThrow(() ->
                        new RuntimeException("Статус не найден")
                );
        Client client = new Client();

        client.setLastName(dto.getLastName());
        client.setFirstName(dto.getFirstName());
        client.setMiddleName(dto.getMiddleName());
        client.setBirthDate(dto.getBirthDay());
        client.setSocialStatus(socialStatus);
        client.setPhone(dto.getPhone());

        Client savedClient = clientRepo.save(client);

        return mapToResponse(savedClient);
    }

    @Override
    @Transactional
    public ClientResponseDto updateClient(Integer id, ClientRequestDto dto){

        Client client = clientRepo.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Клиент не найден")
                );

        SocialStatus socialStatus = socialStatusRepo
                .findById(dto.getSocialStatusId())
                .orElseThrow(() ->
                        new RuntimeException("Статус не найден")
                );

        client.setFirstName(dto.getFirstName());
        client.setLastName(dto.getLastName());
        client.setMiddleName(dto.getMiddleName());
        client.setBirthDate(dto.getBirthDay());
        client.setSocialStatus(socialStatus);
        client.setPhone(dto.getPhone());

        return mapToResponse(client);
    }

    @Override
    @Transactional
    public void deleteClient(Integer id){

        if(!clientRepo.existsById(id)) {throw new RuntimeException("Клиент не найден");}

        clientRepo.deleteById(id);
    }

    private ClientResponseDto mapToResponse(Client client){

        return new ClientResponseDto(
            client.getClientId(),

            client.getFirstName(),

            client.getLastName(),

            client.getMiddleName(),

            client.getBirthDate(),

            client.getSocialStatus().getStatusName(),

                client.getSocialStatus().getStatusName()
        );
    }
}

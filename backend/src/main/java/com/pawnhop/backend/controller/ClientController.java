package com.pawnhop.backend.controller;

import com.pawnhop.backend.dto.request.ClientRequestDto;
import com.pawnhop.backend.dto.response.ClientResponseDto;
import com.pawnhop.backend.service.ClientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;

    // GET /api/clients
    @GetMapping
    public List<ClientResponseDto> getAllClients(){

        return clientService.getAllClients();
    }

    // GET /api/clients/{id}
    @GetMapping("/{id}")
    public ClientResponseDto getClientById(
            @PathVariable Integer id
    ){

        return clientService.getClientById(id);
    }

    // POST /api/clients
    @PostMapping
    public ClientResponseDto createClient(
            @Valid @RequestBody ClientRequestDto dto
    ){

        return  clientService.createClient(dto);
    }

    // PUT /api/clients/{id}
    @PutMapping("/{id}")
    public ClientResponseDto updateClient(
            @PathVariable Integer id,
            @Valid @RequestBody ClientRequestDto dto
    ){

        return clientService.updateClient(id, dto);
    }

    // DELETE /api/clients/{id}
    @DeleteMapping("/{id}")
    public void deleteClient(
            @PathVariable Integer id
    ){
        clientService.deleteClient(id);
    }
}

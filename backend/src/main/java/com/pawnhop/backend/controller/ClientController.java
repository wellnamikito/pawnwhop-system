package com.pawnhop.backend.controller;

import com.pawnhop.backend.dto.request.ClientRequestDto;
import com.pawnhop.backend.dto.response.ClientResponseDto;
import com.pawnhop.backend.service.ClientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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

    // GET /api/clients/page
    @GetMapping("/page")
    public Page<ClientResponseDto> getClientById(
            @PageableDefault(size = 50, sort = "clientId")
            Pageable pageable
    ){

        return clientService.getClientsPage(pageable);
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

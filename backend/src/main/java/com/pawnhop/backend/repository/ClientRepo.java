package com.pawnhop.backend.repository;

import com.pawnhop.backend.entity.Client;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClientRepo extends JpaRepository<Client, Integer> {

    @Override
    @EntityGraph(attributePaths = {"socialStatus"})
    List<Client> findAll();

    @Override
    @EntityGraph(attributePaths = {"socialStatus"})
    Page<Client> findAll(Pageable pageable);
}

package com.pawnhop.backend.repository;

import com.pawnhop.backend.entity.Pawnshop;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.web.PageableDefault;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PawnshopRepo extends JpaRepository<Pawnshop, Integer> {

    @Override
    @EntityGraph(attributePaths = {
            "ownershipTypeId",
            "ownerId",
            "districtId"
    })
    List<Pawnshop> findAll();

    @Override
    @EntityGraph(attributePaths = {
            "ownershipTypeId",
            "ownerId",
            "districtId"
    })
    Page<Pawnshop> findAll(Pageable pageable);
}

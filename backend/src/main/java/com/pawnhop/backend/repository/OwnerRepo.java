package com.pawnhop.backend.repository;

import com.pawnhop.backend.entity.Owner;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OwnerRepo extends JpaRepository<Owner, Integer> {

    @Override
    @EntityGraph(attributePaths = {"ownerTypeId"})
    List<Owner> findAll();

    @Override
    @EntityGraph(attributePaths = {"ownerTypeId"})
    Page<Owner> findAll(Pageable pageable);
}

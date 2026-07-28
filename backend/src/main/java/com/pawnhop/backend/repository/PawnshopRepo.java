package com.pawnhop.backend.repository;

import com.pawnhop.backend.entity.Pawnshop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PawnshopRepo extends JpaRepository<Pawnshop, Integer> {
}

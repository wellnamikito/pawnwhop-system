package com.pawnhop.backend.repository;

import com.pawnhop.backend.entity.OwnershipType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OwnershipTypeRepo extends JpaRepository<OwnershipType, Integer> {
}

package com.pawnhop.backend.repository;

import com.pawnhop.backend.entity.OwnerType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OwnerTypeRepo extends JpaRepository<OwnerType, Integer> {
}

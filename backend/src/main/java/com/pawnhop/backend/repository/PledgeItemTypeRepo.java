package com.pawnhop.backend.repository;

import com.pawnhop.backend.entity.PledgeItemType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PledgeItemTypeRepo extends JpaRepository<PledgeItemType, Integer> {
}

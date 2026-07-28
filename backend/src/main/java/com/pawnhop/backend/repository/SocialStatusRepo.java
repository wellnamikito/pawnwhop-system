package com.pawnhop.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.pawnhop.backend.entity.socialStatus;

@Repository
public interface SocialStatusRepo extends JpaRepository<socialStatus, Integer> {
}

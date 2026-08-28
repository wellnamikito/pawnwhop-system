package com.pawnhop.backend.repository;

import com.pawnhop.backend.entity.Owner;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("""
    SELECT o FROM Owner o
    JOIN FETCH o.ownerTypeId ot
    WHERE LOWER(o.lastName) LIKE LOWER(CONCAT('%', :search, '%'))
       OR LOWER(o.firstName) LIKE LOWER(CONCAT('%', :search, '%'))
       OR LOWER(COALESCE(o.middleName, '')) LIKE LOWER(CONCAT('%', :search, '%'))
       OR LOWER(CONCAT(o.lastName, ' ', o.firstName, ' ', COALESCE(o.middleName, '')))
            LIKE LOWER(CONCAT('%', :search, '%'))
       OR LOWER(ot.typeName) LIKE LOWER(CONCAT('%', :search, '%'))
       OR LOWER(COALESCE(o.phone, '')) LIKE LOWER(CONCAT('%', :search, '%'))
""")
    Page<Owner> search(
            @Param("search") String search,
            Pageable pageable
    );
}

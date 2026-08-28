package com.pawnhop.backend.repository;

import com.pawnhop.backend.entity.Pawnshop;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("""
            SELECT p FROM Pawnshop p
            JOIN FETCH p.ownershipTypeId ot
            JOIN FETCH p.ownerId o
            JOIN FETCH p.districtId d
            WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(ot.typeName) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(CONCAT(o.lastName, ' ', o.firstName, ' ', COALESCE(o.middleName, '')))
                    LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(d.districtName) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(p.address) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(COALESCE(p.phone, '')) LIKE LOWER(CONCAT('%', :search, '%'))
            """)
    Page<Pawnshop> search(
            @Param("search") String search,
            Pageable pageable
    );
}

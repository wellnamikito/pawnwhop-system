package com.pawnhop.backend.repository;

import com.pawnhop.backend.entity.Client;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("""
    SELECT c
    FROM Client c
    JOIN c.socialStatus ss
    WHERE
        LOWER(CONCAT(c.lastName, ' ', c.firstName, ' ', COALESCE(c.middleName, '')))
            LIKE LOWER(CONCAT('%', :search, '%'))
        OR CAST(c.birthDate AS string)
            LIKE CONCAT('%', :search, '%')
        OR LOWER(ss.statusName)
            LIKE LOWER(CONCAT('%', :search, '%'))
        OR LOWER(COALESCE(c.address, ''))
            LIKE LOWER(CONCAT('%', :search, '%'))
        OR LOWER(COALESCE(c.phone, ''))
            LIKE LOWER(CONCAT('%', :search, '%'))
""")
    Page<Client> search(
            @Param("search") String search,
            Pageable pageable
    );
}

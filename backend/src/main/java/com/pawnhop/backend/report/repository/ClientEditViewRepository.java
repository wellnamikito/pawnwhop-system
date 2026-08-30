package com.pawnhop.backend.report.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import com.pawnhop.backend.report.dto.ClientEditViewDto;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class ClientEditViewRepository {

    private final JdbcTemplate jdbcTemplate;

    public Page<ClientEditViewDto> findAll(Pageable pageable) {

        String sql = """
                SELECT
                    client_id,
                    last_name,
                    first_name,
                    middle_name,
                    birth_date,
                    address,
                    phone
                FROM public.vw_client_edit
                ORDER BY client_id
                LIMIT ? OFFSET ?
                """;

        List<ClientEditViewDto> content = jdbcTemplate.query(
                sql,
                (rs, rowNum) -> new ClientEditViewDto(
                        rs.getInt("client_id"),
                        rs.getString("last_name"),
                        rs.getString("first_name"),
                        rs.getString("middle_name"),
                        rs.getObject("birth_date", java.time.LocalDate.class),
                        rs.getString("address"),
                        rs.getString("phone")
                ),
                pageable.getPageSize(),
                pageable.getOffset()
        );

        Long total = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM public.vw_client_edit
                """,
                Long.class
        );

        return new PageImpl<>(
                content,
                pageable,
                total != null ? total : 0
        );
    }

    public int update(ClientEditViewDto dto) {

        return jdbcTemplate.update(
                """
                UPDATE public.vw_client_edit
                SET
                    last_name = ?,
                    first_name = ?,
                    middle_name = ?,
                    birth_date = ?,
                    address = ?,
                    phone = ?
                WHERE client_id = ?
                """,
                dto.lastName(),
                dto.firstName(),
                dto.middleName(),
                dto.birthDate(),
                dto.address(),
                dto.phone(),
                dto.clientId()
        );
    }
}

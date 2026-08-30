package com.pawnhop.backend.auth.database;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class DatabasePermissionsIntegrationTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @AfterEach
    void clearRoutingContext() {
        DatabaseRoutingContext.clear();
    }

    @Test
    void adminShouldBeAbleToReadDatabase() {
        DatabaseRoutingContext.setRole(DatabaseRole.ADMIN);

        Integer count = jdbcTemplate.queryForObject(
                "SELECT count(*) FROM client",
                Integer.class
        );

        assertNotNull(count);
    }

    @Test
    void operatorShouldBeAbleToReadDatabase() {
        DatabaseRoutingContext.setRole(DatabaseRole.OPERATOR);

        Integer count = jdbcTemplate.queryForObject(
                "SELECT count(*) FROM client",
                Integer.class
        );

        assertNotNull(count);
    }

    @Test
    void analystShouldBeAbleToReadDatabase() {
        DatabaseRoutingContext.setRole(DatabaseRole.ANALYST);

        Integer count = jdbcTemplate.queryForObject(
                "SELECT count(*) FROM client",
                Integer.class
        );

        assertNotNull(count);
    }

    @Test
    void analystShouldNotBeAbleToDeleteClient() {
        DatabaseRoutingContext.setRole(DatabaseRole.ANALYST);

        assertThrows(
                DataAccessException.class,
                () -> jdbcTemplate.update(
                        "DELETE FROM client WHERE id = -1"
                )
        );
    }

    @Test
    void analystShouldNotBeAbleToModifyClient() {
        DatabaseRoutingContext.setRole(DatabaseRole.ANALYST);

        assertThrows(
                DataAccessException.class,
                () -> jdbcTemplate.update(
                        "UPDATE client SET first_name = first_name WHERE id = -1"
                )
        );

        assertThrows(
                DataAccessException.class,
                () -> jdbcTemplate.update(
                        "INSERT INTO client (id) VALUES (-1)"
                )
        );
    }

}
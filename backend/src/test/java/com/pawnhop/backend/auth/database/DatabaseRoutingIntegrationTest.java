package com.pawnhop.backend.auth.database;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
class DatabaseRoutingIntegrationTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @AfterEach
    void clearRoutingContext() {
        DatabaseRoutingContext.clear();
    }

    @Test
    void adminRoleShouldUseAdminDatabaseUser() {

        DatabaseRoutingContext.setRole(DatabaseRole.ADMIN);

        String currentUser = jdbcTemplate.queryForObject(
                "SELECT current_user",
                String.class
        );

        assertEquals(
                "pawnwhop_admin",
                currentUser
        );
    }

    @Test
    void operatorRoleShouldUseOperatorDatabaseUser() {

        DatabaseRoutingContext.setRole(DatabaseRole.OPERATOR);

        String currentUser = jdbcTemplate.queryForObject(
                "SELECT current_user",
                String.class
        );

        assertEquals(
                "pawnwhop_operator",
                currentUser
        );
    }

    @Test
    void analystRoleShouldUseAnalystDatabaseUser() {

        DatabaseRoutingContext.setRole(DatabaseRole.ANALYST);

        String currentUser = jdbcTemplate.queryForObject(
                "SELECT current_user",
                String.class
        );

        assertEquals(
                "pawnwhop_analyst",
                currentUser
        );
    }
}
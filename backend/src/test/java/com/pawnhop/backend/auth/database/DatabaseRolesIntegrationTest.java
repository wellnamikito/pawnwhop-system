package com.pawnhop.backend.auth.database;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
class DatabaseRolesIntegrationTest {

    @Autowired
    @Qualifier("adminDataSource")
    private javax.sql.DataSource adminDataSource;

    private JdbcTemplate jdbcTemplate;

    @Autowired
    void setUpJdbcTemplate(
            @Qualifier("adminDataSource")
            javax.sql.DataSource dataSource
    ) {
        this.jdbcTemplate = new JdbcTemplate(dataSource);
    }

    @AfterEach
    void clearRoutingContext() {
        DatabaseRoutingContext.clear();
    }

    @Test
    void usersShouldHaveCorrectRoles() {

        Map<String, String> roles = jdbcTemplate.query(
                """
                SELECT
                    member.rolname AS user_name,
                    role.rolname AS granted_role
                FROM pg_auth_members am
                JOIN pg_roles member
                    ON member.oid = am.member
                JOIN pg_roles role
                    ON role.oid = am.roleid
                WHERE member.rolname IN (
                    'pawnwhop_admin',
                    'pawnwhop_operator',
                    'pawnwhop_analyst'
                )
                """,
                rs -> {
                    Map<String, String> result =
                            new java.util.HashMap<>();

                    while (rs.next()) {
                        result.put(
                                rs.getString("user_name"),
                                rs.getString("granted_role")
                        );
                    }

                    return result;
                }
        );

        assertEquals(
                "admin_role",
                roles.get("pawnwhop_admin")
        );

        assertEquals(
                "operator_role",
                roles.get("pawnwhop_operator")
        );

        assertEquals(
                "analyst_role",
                roles.get("pawnwhop_analyst")
        );
    }

    @Test
    void rowLevelSecurityShouldBeEnabled() {

        Integer count = jdbcTemplate.queryForObject(
                """
                SELECT count(*)
                FROM pg_tables
                WHERE schemaname = 'public'
                  AND tablename IN (
                    'pawnshop',
                    'owners',
                    'client',
                    'loan',
                    'loan_item',
                    'loan_document',
                    'district',
                    'owner_type',
                    'ownership_type',
                    'social_status',
                    'pledge_item_type',
                    'loan_range',
                    'loan_list',
                    'loan_plain'
                  )
                  AND rowsecurity = true
                """,
                Integer.class
        );

        assertEquals(14, count);
    }

    @Test
    void rowLevelSecurityShouldBeForced() {

        Integer count = jdbcTemplate.queryForObject(
                """
                SELECT count(*)
                FROM pg_class c
                JOIN pg_namespace n
                    ON n.oid = c.relnamespace
                WHERE n.nspname = 'public'
                  AND c.relname IN (
                    'pawnshop',
                    'owners',
                    'client',
                    'loan',
                    'loan_item',
                    'loan_document',
                    'district',
                    'owner_type',
                    'ownership_type',
                    'social_status',
                    'pledge_item_type',
                    'loan_range',
                    'loan_list',
                    'loan_plain'
                  )
                  AND c.relforcerowsecurity = true
                """,
                Integer.class
        );

        assertEquals(14, count);
    }
}
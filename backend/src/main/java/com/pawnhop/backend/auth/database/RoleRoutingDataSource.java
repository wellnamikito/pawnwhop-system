package com.pawnhop.backend.auth.database;

import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

public class RoleRoutingDataSource extends AbstractRoutingDataSource {

    @Override
    protected Object determineCurrentLookupKey() {

        DatabaseRole role = DatabaseRoutingContext.getRole();

        if (role == null) {
            throw new IllegalStateException(
                    "PostgreSQL role is not set for current request"
            );
        }

        return role;
    }
}

package com.pawnhop.backend.auth.database;

public final class DatabaseRoutingContext {

    private static final ThreadLocal<DatabaseRole> CURRENT_ROLE =
            new ThreadLocal<>();

    private DatabaseRoutingContext() {
    }

    public static void setRole(DatabaseRole role) {
        CURRENT_ROLE.set(role);
    }

    public static DatabaseRole getRole() {
        return CURRENT_ROLE.get();
    }

    public static void clear() {
        CURRENT_ROLE.remove();
    }
}

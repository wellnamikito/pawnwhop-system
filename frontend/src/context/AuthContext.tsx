import React, { createContext, useContext, useEffect, useState } from "react";
import type { AppUser, Role } from "@/types";
import { authApi } from "@/api/endpoints";

/**
 * Implements requirement #1/#2 from the spec: "one program for all roles -
 * situational access to the interface" and "several user roles".
 *
 * This matrix mirrors backend/.../auth/config/SecurityConfig.java exactly -
 * keep the two in sync if you change one:
 *
 *   ADMIN    - full access everywhere, incl. dictionary edits and DELETE
 *              on core tables (SecurityConfig: hasRole("ADMIN") on DELETE)
 *   OPERATOR - "пользователи_1": can view/create/edit pawnshops, owners,
 *              clients, loans - but NOT delete them (DELETE is ADMIN-only
 *              in SecurityConfig) and NOT touch dictionaries or reports
 *              (SecurityConfig only grants /api/report/** to ADMIN/ANALYST)
 *   ANALYST  - "пользователи_2": read-only everywhere, plus reports
 *
 * There is no "users" resource: the backend has no /api/users endpoint.
 * Login/roles are backed directly by real PostgreSQL roles
 * (admin_role/operator_role/analyst_role via PostgreSQLAuthService) - user
 * management happens at the database level, not through this UI.
 */

type Action = "view" | "create" | "edit" | "delete";
type Resource =
  | "dictionaries"
  | "pawnshops"
  | "owners"
  | "clients"
  | "loans"
  | "reports";

const PERMISSIONS: Record<Role, Record<Resource, Action[]>> = {
  ADMIN: {
    dictionaries: ["view", "create", "edit", "delete"],
    pawnshops: ["view", "create", "edit", "delete"],
    owners: ["view", "create", "edit", "delete"],
    clients: ["view", "create", "edit", "delete"],
    loans: ["view", "create", "edit", "delete"],
    reports: ["view"],
  },
  OPERATOR: {
    dictionaries: ["view"],
    pawnshops: ["view", "create", "edit"],
    owners: ["view", "create", "edit"],
    clients: ["view", "create", "edit"],
    loans: ["view", "create", "edit"],
    reports: [],
  },
  ANALYST: {
    dictionaries: ["view"],
    pawnshops: ["view"],
    owners: ["view"],
    clients: ["view"],
    loans: ["view"],
    reports: ["view"],
  },
};

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  can: (resource: Resource, action: Action) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = localStorage.getItem("auth_user");
    const token = localStorage.getItem("auth_token");
    if (cached && token) {
      setUser(JSON.parse(cached));
      // Re-validate with the backend in the background.
      authApi
        .me()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(username: string, password: string) {
    const { token, user: loggedInUser } = await authApi.login(username, password);
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  }

  function logout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setUser(null);
  }

  function can(resource: Resource, action: Action) {
    if (!user) return false;
    return PERMISSIONS[user.role][resource].includes(action);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

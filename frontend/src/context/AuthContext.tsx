import React, { createContext, useContext, useEffect, useState } from "react";
import type { AppUser, Role } from "@/types";
import { authApi } from "@/api/endpoints";

/**
 * Implements requirement #1/#2 from the spec: "one program for all roles -
 * situational access to the interface" and "several user roles".
 *
 *   ADMIN    - manages users & their roles/permissions (owner_type,
 *              district etc. dictionaries), full CRUD everywhere.
 *   OPERATOR - "пользователи_1": day-to-day data entry - clients, loans,
 *              pledged items; full CRUD on operational tables, no user mgmt.
 *   ANALYST  - "пользователи_2": read-only browsing, search/filter,
 *              query results and visualization/export only.
 *
 * Every page reads `can(...)` from this context to decide what to show,
 * instead of maintaining separate apps/builds per role.
 */

type Action = "view" | "create" | "edit" | "delete";
type Resource =
  | "dictionaries"
  | "pawnshops"
  | "owners"
  | "clients"
  | "loans"
  | "users"
  | "reports";

const PERMISSIONS: Record<Role, Record<Resource, Action[]>> = {
  ADMIN: {
    dictionaries: ["view", "create", "edit", "delete"],
    pawnshops: ["view", "create", "edit", "delete"],
    owners: ["view", "create", "edit", "delete"],
    clients: ["view", "create", "edit", "delete"],
    loans: ["view", "create", "edit", "delete"],
    users: ["view", "create", "edit", "delete"],
    reports: ["view"],
  },
  OPERATOR: {
    dictionaries: ["view"],
    pawnshops: ["view", "create", "edit", "delete"],
    owners: ["view", "create", "edit", "delete"],
    clients: ["view", "create", "edit", "delete"],
    loans: ["view", "create", "edit", "delete"],
    users: [],
    reports: ["view"],
  },
  ANALYST: {
    dictionaries: ["view"],
    pawnshops: ["view"],
    owners: ["view"],
    clients: ["view"],
    loans: ["view"],
    users: [],
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

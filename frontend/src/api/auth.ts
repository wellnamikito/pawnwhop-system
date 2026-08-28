import api from "./client";
import type { AppUser, Role } from "@/types/auth";

interface LoginResponse {
    username: string;
    role: string;
    token: string;
}

interface MeResponse {
    username: string;
    role: string;
}

function normalizeRole(rawRole: string): Role {
    const role = rawRole
        .replace("ROLE_", "")
        .replace("_role", "")
        .toUpperCase();

    if (role === "ADMIN" || role === "OPERATOR" || role === "ANALYST") {
        return role;
    }

    throw new Error(`Сервер вернул неизвестную роль: ${rawRole}`);
}

function toUser(data: MeResponse): AppUser {
    return {
        username: data.username,
        role: normalizeRole(data.role),
    };
}

export const authApi = {
    async login(username: string, password: string) {
        const response = await api.post<LoginResponse>("/auth/login", {
            username,
            password,
        });

        return {
            token: response.data.token,
            user: toUser(response.data),
        };
    },

    async me() {
        const response = await api.get<MeResponse>("/auth/me");
        return toUser(response.data);
    },
};
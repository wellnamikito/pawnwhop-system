import type { AppUser } from "@/types";

const admin: AppUser = {
    user_id: 1,
    username: "admin",
    full_name: "Администратор",
    role: "ADMIN",
};

export async function login(username: string, password: string) {
    await new Promise((r) => setTimeout(r, 500));

    if (username === "admin" && password === "admin123") {
        return {
            token: "mock-token",
            user: admin,
        };
    }

    throw new Error("Неверный логин или пароль");
}

export async function me() {
    return admin;
}
export type Role = "ADMIN" | "OPERATOR" | "ANALYST";

export type Resource =
    | "dashboard"
    | "loans"
    | "clients"
    | "pawnshops"
    | "owners"
    | "dictionaries"
    | "reports"
    | "users";

export type Action = "view" | "create" | "edit" | "delete";

export interface AppUser {
    username: string;
    role: Role;
}
/**
 * These interfaces mirror the PostgreSQL schema 1:1 so that JSON coming back
 * from the Spring Boot REST API can be typed without transformation.
 * Domain constraints (CHECK's) from the SQL are documented in comments and
 * re-enforced client-side in src/utils/validation.ts, but the backend
 * remains the source of truth for validation.
 */

// ---------- Reference / dictionary tables ----------

export interface PledgeItemType {
  item_type_id: number;
  type_name: string;
}

export interface OwnershipType {
  ownership_type_id: number;
  type_name: string;
}

export interface District {
  district_id: number;
  district_name: string;
}

export interface OwnerType {
  owner_type_id: number;
  type_name: string;
}

export interface SocialStatus {
  social_status_id: number;
  status_name: string;
}

// ---------- Core entities ----------

export interface Owner {
  owner_id: number;
  last_name: string;
  first_name: string;
  middle_name?: string | null;
  owner_type_id: number;
  phone?: string | null; // +7XXXXXXXXXX
}

export interface Pawnshop {
  pawnshop_id: number;
  name: string;
  ownership_type_id: number;
  owner_id: number;
  district_id: number;
  address: string;
  phone?: string | null;
  opening_hour?: number | null; // 0-23
  closing_hour?: number | null; // 0-23, must be > opening_hour
}

export interface Client {
  client_id: number;
  last_name: string;
  first_name: string;
  middle_name?: string | null;
  birth_date?: string | null; // ISO date
  social_status_id?: number | null;
  address?: string | null;
  phone?: string | null;
}

export interface Loan {
  loan_id: number;
  pawnshop_id: number;
  client_id: number;
  amount: number; // > 0
  issue_date: string; // ISO date
  return_date?: string | null;
  penalty_percent?: number | null; // 0-100
  is_returned: boolean;
}

export interface LoanItem {
  loan_id: number;
  item_type_id: number;
  item_description?: string | null;
  item_value: number; // > 0
}

// A Loan together with its pledged items, used for the master-detail form
// required by the spec ("составная форма для родительской и дочерней таблиц").
export interface LoanWithItems extends Loan {
  items: LoanItem[];
}

// ---------- Auth / roles ----------

export type Role = "ADMIN" | "OPERATOR" | "ANALYST";

export interface AppUser {
  user_id: number;
  username: string;
  full_name: string;
  role: Role;
}

// ---------- Generic helpers ----------

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface SortState {
  field: string;
  direction: "asc" | "desc";
}

import api from "./client";
import type {
  AppUser,
  Client,
  District,
  Loan,
  LoanItem,
  LoanWithItems,
  Owner,
  OwnerType,
  OwnershipType,
  Pawnshop,
  PledgeItemType,
  Role,
  SocialStatus,
} from "@/types";
import * as mockAuth from "@/mocks/auth.mock";

/**
 * Thin wrapper describing the REST contract this frontend expects from the
 * Spring Boot backend. Adjust paths here if your @RequestMapping's differ -
 * this is the only file (besides client.ts) that needs to change.
 */

// ---------- Generic CRUD factory ----------
// Expected Spring Boot side: a @RestController exposing
//   GET    /api/{resource}?search=&page=&size=&sort=
//   GET    /api/{resource}/{id}
//   POST   /api/{resource}
//   PUT    /api/{resource}/{id}
//   DELETE /api/{resource}/{id}
function crud<T, ID = number>(resource: string) {
  return {
    list: (params?: Record<string, unknown>) =>
      api.get<T[]>(`/${resource}`, { params }).then((r) => r.data),
    get: (id: ID) => api.get<T>(`/${resource}/${id}`).then((r) => r.data),
    create: (payload: Partial<T>) =>
      api.post<T>(`/${resource}`, payload).then((r) => r.data),
    update: (id: ID, payload: Partial<T>) =>
      api.put<T>(`/${resource}/${id}`, payload).then((r) => r.data),
    remove: (id: ID) => api.delete<void>(`/${resource}/${id}`).then((r) => r.data),
  };
}

// ---------- Dictionaries (справочники) ----------
export const districtApi = crud<District>("districts");
export const ownershipTypeApi = crud<OwnershipType>("ownership-types");
export const ownerTypeApi = crud<OwnerType>("owner-types");
export const socialStatusApi = crud<SocialStatus>("social-statuses");
export const pledgeItemTypeApi = crud<PledgeItemType>("pledge-item-types");

// ---------- Core entities ----------
export const ownerApi = crud<Owner>("owners");
export const pawnshopApi = crud<Pawnshop>("pawnshops");
export const clientApi = crud<Client>("clients");
export const loanApi = crud<Loan>("loans");

// Loans are a parent (1) - loan_item is the child (many), matching the
// "один-ко-многим" master-detail requirement. loan_item has a composite key
// (loan_id, item_type_id), so it's handled as a nested sub-resource rather
// than through the generic crud<> factory.
export const loanItemApi = {
  listForLoan: (loanId: number) =>
    api.get<LoanItem[]>(`/loans/${loanId}/items`).then((r) => r.data),
  getWithItems: (loanId: number) =>
    api.get<LoanWithItems>(`/loans/${loanId}?expand=items`).then((r) => r.data),
  add: (loanId: number, payload: Partial<LoanItem>) =>
    api.post<LoanItem>(`/loans/${loanId}/items`, payload).then((r) => r.data),
  update: (loanId: number, itemTypeId: number, payload: Partial<LoanItem>) =>
    api
      .put<LoanItem>(`/loans/${loanId}/items/${itemTypeId}`, payload)
      .then((r) => r.data),
  remove: (loanId: number, itemTypeId: number) =>
    api.delete<void>(`/loans/${loanId}/items/${itemTypeId}`).then((r) => r.data),
};

// ---------- Auth / users (администратор управляет пользователями и ролями) ----------
const useMock = true;

export const authApi = useMock
    ? mockAuth
    : {
      login: (username: string, password: string) =>
          api
              .post<{ token: string; user: AppUser }>("/auth/login", {
                username,
                password,
              })
              .then((r) => r.data),

      me: () => api.get<AppUser>("/auth/me").then((r) => r.data),
    };

export const userApi = {
  ...crud<AppUser>("users"),
  setRole: (id: number, role: Role) =>
    api.patch<AppUser>(`/users/${id}/role`, { role }).then((r) => r.data),
};

// ---------- Reporting / query results / visualization ----------
// "просмотр результатов выполнения запросов" + "визуализация одного из
// итоговых запросов" from the spec. Backend exposes pre-built report
// endpoints (Spring Boot service methods run the SQL/JPQL queries); the
// frontend just requests and renders the results.
export const reportApi = {
  // e.g. amount lent per district, overdue loans, most pledged item types...
  loansByDistrict: () =>
    api.get<{ district_name: string; total_amount: number }[]>(
      "/reports/loans-by-district"
    ).then((r) => r.data),
  overdueLoans: () => api.get<Loan[]>("/reports/overdue-loans").then((r) => r.data),
  topItemTypes: () =>
    api
      .get<{ type_name: string; loan_count: number }[]>("/reports/top-item-types")
      .then((r) => r.data),
};

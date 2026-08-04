import api from "./client";
import {
  MOCK_ENABLED,
  mockAuthApi,
  mockClientApi,
  mockDistrictApi,
  mockLoanApi,
  mockLoanItemApi,
  mockOwnerApi,
  mockOwnerTypeApi,
  mockOwnershipTypeApi,
  mockPawnshopApi,
  mockPledgeItemTypeApi,
  mockReportApi,
  mockSocialStatusApi,
} from "./mockData";
import {
  type ClientDto,
  type DictionaryDto,
  type LoanDto,
  type LoanItemDto,
  type OwnerDto,
  type PawnshopDto,
  normalizeRole,
  toClient,
  toClientRequest,
  toDistrict,
  toLoan,
  toLoanItem,
  toLoanItemRequest,
  toLoanRequest,
  toOwner,
  toOwnerRequest,
  toOwnerType,
  toOwnershipType,
  toPawnshop,
  toPawnshopRequest,
  toPledgeItemType,
  toSocialStatus,
} from "./adapters";
import type {
  AppUser,
  Client,
  District,
  Loan,
  LoanItem,
  Owner,
  OwnerType,
  OwnershipType,
  Pawnshop,
  PledgeItemType,
  SocialStatus,
} from "@/types";

// ============================================================================
// Dictionaries (справочники) - backend returns/accepts a generic {id, name}
// shape for all 5 tables (see DictionaryResponseDto / DictionaryRequestDto).
// ============================================================================

function dictionaryApiFor<T extends Record<string, any>>(
  path: string,
  toModel: (d: DictionaryDto) => T,
  nameField: keyof T
) {
  return {
    list: () => api.get<DictionaryDto[]>(`/${path}`).then((r) => r.data.map(toModel)),
    create: (payload: Partial<T>) =>
      api.post<DictionaryDto>(`/${path}`, { name: payload[nameField] }).then((r) => toModel(r.data)),
    update: (id: number, payload: Partial<T>) =>
      api.put<DictionaryDto>(`/${path}/${id}`, { name: payload[nameField] }).then((r) => toModel(r.data)),
    remove: (id: number) => api.delete<void>(`/${path}/${id}`).then((r) => r.data),
  };
}

export const districtApi = MOCK_ENABLED
  ? mockDistrictApi
  : dictionaryApiFor<District>("districts", toDistrict, "district_name");
export const ownershipTypeApi = MOCK_ENABLED
  ? mockOwnershipTypeApi
  : dictionaryApiFor<OwnershipType>("ownership-types", toOwnershipType, "type_name");
export const ownerTypeApi = MOCK_ENABLED
  ? mockOwnerTypeApi
  : dictionaryApiFor<OwnerType>("owner-types", toOwnerType, "type_name");
export const socialStatusApi = MOCK_ENABLED
  ? mockSocialStatusApi
  : dictionaryApiFor<SocialStatus>("social-statuses", toSocialStatus, "status_name");
export const pledgeItemTypeApi = MOCK_ENABLED
  ? mockPledgeItemTypeApi
  : dictionaryApiFor<PledgeItemType>("pledge-item-types", toPledgeItemType, "type_name");

// ============================================================================
// Owners
// ============================================================================

export const ownerApi = MOCK_ENABLED
  ? mockOwnerApi
  : {
      list: async (): Promise<Owner[]> => {
        const [owners, ownerTypes] = await Promise.all([
          api.get<OwnerDto[]>("/owners").then((r) => r.data),
          ownerTypeApi.list(),
        ]);
        return owners.map((o) => toOwner(o, ownerTypes));
      },
      create: async (payload: Partial<Owner>): Promise<Owner> => {
        const ownerTypes = await ownerTypeApi.list();
        return api
          .post<OwnerDto>("/owners", toOwnerRequest(payload))
          .then((r) => toOwner(r.data, ownerTypes));
      },
      update: async (id: number, payload: Partial<Owner>): Promise<Owner> => {
        const ownerTypes = await ownerTypeApi.list();
        return api
          .put<OwnerDto>(`/owners/${id}`, toOwnerRequest(payload))
          .then((r) => toOwner(r.data, ownerTypes));
      },
      remove: (id: number) => api.delete<void>(`/owners/${id}`).then((r) => r.data),
    };

// ============================================================================
// Pawnshops
// ============================================================================

export const pawnshopApi = MOCK_ENABLED
  ? mockPawnshopApi
  : {
      list: async (): Promise<Pawnshop[]> => {
        const [pawnshops, ownershipTypes, districts, owners] = await Promise.all([
          api.get<PawnshopDto[]>("/pawnshops").then((r) => r.data),
          ownershipTypeApi.list(),
          districtApi.list(),
          ownerApi.list(),
        ]);
        return pawnshops.map((p) => toPawnshop(p, { ownershipTypes, districts, owners }));
      },
      create: async (payload: Partial<Pawnshop>): Promise<Pawnshop> => {
        const [ownershipTypes, districts, owners] = await Promise.all([
          ownershipTypeApi.list(),
          districtApi.list(),
          ownerApi.list(),
        ]);
        return api
          .post<PawnshopDto>("/pawnshops", toPawnshopRequest(payload))
          .then((r) => toPawnshop(r.data, { ownershipTypes, districts, owners }));
      },
      update: async (id: number, payload: Partial<Pawnshop>): Promise<Pawnshop> => {
        const [ownershipTypes, districts, owners] = await Promise.all([
          ownershipTypeApi.list(),
          districtApi.list(),
          ownerApi.list(),
        ]);
        return api
          .put<PawnshopDto>(`/pawnshops/${id}`, toPawnshopRequest(payload))
          .then((r) => toPawnshop(r.data, { ownershipTypes, districts, owners }));
      },
      remove: (id: number) => api.delete<void>(`/pawnshops/${id}`).then((r) => r.data),
    };

// ============================================================================
// Clients
// ============================================================================

export const clientApi = MOCK_ENABLED
  ? mockClientApi
  : {
      list: async (): Promise<Client[]> => {
        const [clients, socialStatuses] = await Promise.all([
          api.get<ClientDto[]>("/clients").then((r) => r.data),
          socialStatusApi.list(),
        ]);
        return clients.map((c) => toClient(c, socialStatuses));
      },
      create: async (payload: Partial<Client>): Promise<Client> => {
        const socialStatuses = await socialStatusApi.list();
        return api
          .post<ClientDto>("/clients", toClientRequest(payload))
          .then((r) => toClient(r.data, socialStatuses));
      },
      update: async (id: number, payload: Partial<Client>): Promise<Client> => {
        const socialStatuses = await socialStatusApi.list();
        return api
          .put<ClientDto>(`/clients/${id}`, toClientRequest(payload))
          .then((r) => toClient(r.data, socialStatuses));
      },
      remove: (id: number) => api.delete<void>(`/clients/${id}`).then((r) => r.data),
    };

// ============================================================================
// Loans (parent) + LoanItems (child, composite key loan_id+item_type_id)
// ============================================================================

export const loanApi = MOCK_ENABLED
  ? mockLoanApi
  : {
      list: async (): Promise<Loan[]> => {
        const [loans, pawnshops, clients] = await Promise.all([
          api.get<LoanDto[]>("/loans").then((r) => r.data),
          pawnshopApi.list(),
          clientApi.list(),
        ]);
        return loans.map((l) => toLoan(l, { pawnshops, clients }));
      },
      create: async (payload: Partial<Loan>): Promise<Loan> => {
        const [pawnshops, clients] = await Promise.all([pawnshopApi.list(), clientApi.list()]);
        return api
          .post<LoanDto>("/loans", toLoanRequest(payload))
          .then((r) => toLoan(r.data, { pawnshops, clients }));
      },
      update: async (id: number, payload: Partial<Loan>): Promise<Loan> => {
        const [pawnshops, clients] = await Promise.all([pawnshopApi.list(), clientApi.list()]);
        return api
          .put<LoanDto>(`/loans/${id}`, toLoanRequest(payload))
          .then((r) => toLoan(r.data, { pawnshops, clients }));
      },
      remove: (id: number) => api.delete<void>(`/loans/${id}`).then((r) => r.data),
    };

export const loanItemApi = MOCK_ENABLED
  ? mockLoanItemApi
  : {
      listForLoan: (loanId: number) =>
        api.get<LoanItemDto[]>(`/loans/${loanId}/items`).then((r) => r.data.map(toLoanItem)),
      add: (loanId: number, payload: Partial<LoanItem>) =>
        api
          .post<LoanItemDto>(`/loans/${loanId}/items`, toLoanItemRequest(loanId, payload))
          .then((r) => toLoanItem(r.data)),
      update: (loanId: number, itemTypeId: number, payload: Partial<LoanItem>) =>
        api
          .put<LoanItemDto>(`/loans/${loanId}/items/${itemTypeId}`, toLoanItemRequest(loanId, payload))
          .then((r) => toLoanItem(r.data)),
      remove: (loanId: number, itemTypeId: number) =>
        api.delete<void>(`/loans/${loanId}/items/${itemTypeId}`).then((r) => r.data),
    };

// ============================================================================
// Auth
// ============================================================================
// Backend authenticates directly against PostgreSQL roles - there is no
// /api/users endpoint. Roles ("admin_role"/"operator_role"/"analyst_role")
// are managed by whoever administers the PostgreSQL database (e.g. via
// GRANT/CREATE ROLE, or the SQL scripts under database/), not through this
// UI. See AuthContext.tsx and the chat notes for details.

export const authApi = MOCK_ENABLED
  ? mockAuthApi
  : {
      login: (username: string, password: string) =>
        api
          .post<{ username: string; role: string; token: string }>("/auth/login", { username, password })
          .then((r) => ({
            token: r.data.token,
            user: {
              username: r.data.username,
              full_name: r.data.username,
              role: normalizeRole(r.data.role),
            } as AppUser,
          })),
      me: () =>
        api.get<{ username: string; role: string }>("/auth/me").then(
          (r) =>
            ({
              username: r.data.username,
              full_name: r.data.username,
              role: normalizeRole(r.data.role),
            } as AppUser)
        ),
    };

// ============================================================================
// Reports (see ReportController - /api/report/**, singular). The backend
// exposes ~20 report endpoints; only a curated subset relevant to the
// "Запросы и визуализация" screen is wired up here. See ReportsPage.tsx.
// ============================================================================

export const reportApi = MOCK_ENABLED
  ? mockReportApi
  : {
      // PawnshopLoanCountReportDto: {clientId, name, fistName, loanCount}
      // NB: despite the endpoint's name this DTO is actually per-client, not
      // per-pawnshop - looks like a backend naming/DTO mismatch, flagged in chat.
      loansCountByClient: () =>
        api
          .get<{ clientId: number; name: string; fistName: string; loanCount: number }[]>(
            "/report/statistics/loans-count"
          )
          .then((r) => r.data),
      // PawnshopLoanShareReportDto: {pawnshopId, name, pawnshopTotal, percentOfTotal}
      pawnshopLoanShare: () =>
        api
          .get<{ pawnshopId: number; name: string; pawnshopTotal: number; percentOfTotal: number }[]>(
            "/report/pawnshops/loan-share"
          )
          .then((r) => r.data),
      // OverdueLoanReportDto: {loanId, lastName, phone, returnDate}
      overdueLoans: (reportDate: string) =>
        api
          .get<{ loanId: number; lastName: string; phone: string; returnDate: string }[]>(
            "/report/loans/overdue",
            { params: { reportDate } }
          )
          .then((r) => r.data),
    };

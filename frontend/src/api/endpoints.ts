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
// Reports (see ReportController - /api/report/**, singular). Backend exposes
// 23 report endpoints; all of them are wired up here - see ReportsPage.tsx
// for how they're grouped into "overview" (no params, real pagination) and
// "params" (user fills a form, then runs the query) tabs.
//
// IMPORTANT: endpoints that take a `Pageable` (@PageableDefault(size = 50))
// return Spring's Page<T> JSON shape:
//   { content: T[], totalElements, totalPages, number, size, ... }
// i.e. NOT a bare array - always unwrap `.content`. The handful of endpoints
// whose controller method returns `List<T>` directly (no Pageable param -
// /pawnshops/loan-share, /pawnshops/loan-statistics, /statistics/pawnshop/
// {id}, /clients/{id}/loans/statistics) send back a bare array instead.
// Cross-check against ReportController.java's return type if this ever
// drifts from the backend again.
// ============================================================================

export type SpringPage<T> = {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number; // current page, 0-indexed
    size: number;
};

function fetchReportPage<T>(
    url: string,
    params: Record<string, unknown>,
    page: number,
    size: number
): Promise<SpringPage<T>> {
    return api.get<SpringPage<T>>(url, { params: { ...params, page, size } }).then((r) => r.data);
}

// ---- DTO shapes (mirror the backend records under report/dto 1:1) --------

export type LoansByPawnshopReportDto = { loanId: number; lastName: string; amount: number; issueDate: string };
export type LoanItemsByTypeReportDto = { loanId: number; itemDescription: string; itemValue: number; typeName: string };
export type LoansByPeriodReportDto = { loanId: number; lastName: string; amount: number; issueDate: string };
export type OverdueLoanReportDto = { loanId: number; lastName: string; phone: string; returnDate: string };
export type PawnshopFullReportDto = {
    name: string;
    ownership: string;
    ownerFio: string;
    districtName: string;
    address: string;
    phone: string;
};
export type AllLoansReportDto = {
    pawnshop: string;
    clientFio: string;
    amount: number;
    issueDate: string;
    returnDate: string | null;
    returned: boolean;
};
export type LoanItemFullReportDto = {
    loanId: number;
    lastName: string;
    typeName: string;
    itemDescription: string;
    itemValue: number;
};
export type PawnshopWithLoansReportDto = { name: string; loanId: number; amount: number; issueDate: string };
export type ClientWithLoansReportDto = { lastName: string; firstName: string; loanId: number; amount: number };
export type ClientWithoutLoansReportDto = { clientId: number; lastName: string; firstName: string };
// NB: despite the field names, this DTO is actually per-client (not
// per-pawnshop, despite the endpoint's name) - a backend naming/DTO
// mismatch flagged in chat. `fistName` is a backend typo, not ours.
export type PawnshopLoanCountReportDto = { clientId: number; name: string; fistName: string; loanCount: number };
export type PawnshopLoanStatisticsReportDto = { name: string; loanCount: number; totalAmount: number };
export type PawnshopAverageLoanReportDto = { name: string; loanCount: number; avgAmount: number };
export type ClientLoanStatisticsReportDto = {
    clientId: number;
    lastName: string;
    loanCount: number;
    totalAmount: number;
};
export type ClientMultipleLoansReportDto = {
    clientId: number;
    lastName: string;
    firstName: string;
    loanCount: number;
};
export type PawnshopPledgeValueReportDto = { name: string; districtName: string; totalPledgeValue: number };
export type PawnshopAboveAverageLoanReportDto = { name: string; avgAmount: number };
export type ClientByPledgeTypeReportDto = { clientId: number; lastName: string; firstName: string; phone: string };
export type PawnshopWithoutPledgeTypeReportDto = { pawnshopId: number; name: string };
export type LoanStatusReportDto = {
    loanId: number;
    lastName: string;
    amount: number;
    returnDate: string;
    loanStatus: string;
};
export type PawnshopLoanShareReportDto = {
    pawnshopId: number;
    name: string;
    pawnshopTotal: number;
    percentOfTotal: number;
};
export type PawnshopStatisticsReportDto = {
    pawnshopId: number;
    name: string;
    totalLoans: number;
    returnedCount: number;
    notReturnedCount: number;
};
export type ProblematicLoanReportDto = {
    loanId: number;
    lastName: string;
    phone: string;
    amount: number;
    returnDate: string;
    reason: string;
};

export const reportApi = MOCK_ENABLED
    ? mockReportApi
    : {
        // ---- без параметров, постранично (controller returns Page<T>) ----
        allPawnshops: (page: number, size: number) =>
            fetchReportPage<PawnshopFullReportDto>("/report/pawnshops", {}, page, size),
        allLoans: (page: number, size: number) =>
            fetchReportPage<AllLoansReportDto>("/report/loans", {}, page, size),
        allLoanItems: (page: number, size: number) =>
            fetchReportPage<LoanItemFullReportDto>("/report/loan-items", {}, page, size),
        pawnshopsWithLoans: (page: number, size: number) =>
            fetchReportPage<PawnshopWithLoansReportDto>("/report/pawnshops-with-loans", {}, page, size),
        clientsWithLoans: (page: number, size: number) =>
            fetchReportPage<ClientWithLoansReportDto>("/report/clients-with-loans", {}, page, size),
        clientsWithoutLoans: (page: number, size: number) =>
            fetchReportPage<ClientWithoutLoansReportDto>("/report/clients-without-loans", {}, page, size),
        loansCountByClient: (page: number, size: number) =>
            fetchReportPage<PawnshopLoanCountReportDto>("/report/statistics/loans-count", {}, page, size),
        clientsWithMultipleLoans: (page: number, size: number) =>
            fetchReportPage<ClientMultipleLoansReportDto>("/report/clients/multiple-loans", {}, page, size),
        pawnshopsAboveAverageLoans: (page: number, size: number) =>
            fetchReportPage<PawnshopAboveAverageLoanReportDto>("/report/pawnshops/above-average-loans", {}, page, size),
        loanStatuses: (page: number, size: number) =>
            fetchReportPage<LoanStatusReportDto>("/report/loans/statuses", {}, page, size),

        // ---- без параметров, целиком (controller returns List<T>) ----
        pawnshopLoanShare: () =>
            api.get<PawnshopLoanShareReportDto[]>("/report/pawnshops/loan-share").then((r) => r.data),
        pawnshopLoanStatistics: () =>
            api.get<PawnshopStatisticsReportDto[]>("/report/pawnshops/loan-statistics").then((r) => r.data),

        // ---- с параметрами, постранично (controller returns Page<T>) ----
        loansByPawnshop: (pawnshopId: number, page: number, size: number) =>
            fetchReportPage<LoansByPawnshopReportDto>(`/report/loans-by-pawnshop/${pawnshopId}`, {}, page, size),
        loanItemsByType: (itemTypeId: number, page: number, size: number) =>
            fetchReportPage<LoanItemsByTypeReportDto>(`/report/loans-items-by-type/${itemTypeId}`, {}, page, size),
        loansByPeriod: (startDate: string, endDate: string, page: number, size: number) =>
            fetchReportPage<LoansByPeriodReportDto>("/report/loans/period", { startDate, endDate }, page, size),
        overdueLoans: (reportDate: string, page: number, size: number) =>
            fetchReportPage<OverdueLoanReportDto>("/report/loans/overdue", { reportDate }, page, size),
        loanAverageByAddress: (address: string, page: number, size: number) =>
            // NB: the controller wraps this in "%...%" server-side, so we send
            // the raw text the user typed.
            fetchReportPage<PawnshopAverageLoanReportDto>("/report/statistics/address", { address }, page, size),
        pawnshopsPledgeValue: (districtId: number, minTotalValue: number, page: number, size: number) =>
            fetchReportPage<PawnshopPledgeValueReportDto>(
                "/report/pawnshops/pledge-value",
                { districtId, minTotalValue },
                page,
                size
            ),
        clientsByPledgeItemType: (itemTypeId: number, page: number, size: number) =>
            fetchReportPage<ClientByPledgeTypeReportDto>(
                `/report/clients/by-pledge-item-type/${itemTypeId}`,
                {},
                page,
                size
            ),
        pawnshopsWithoutPledgeItemType: (itemTypeId: number, page: number, size: number) =>
            fetchReportPage<PawnshopWithoutPledgeTypeReportDto>(
                `/report/pawnshops/without-pledge-item-type/${itemTypeId}`,
                {},
                page,
                size
            ),
        problematicLoans: (largeAmountThreshold: number, page: number, size: number) =>
            fetchReportPage<ProblematicLoanReportDto>(
                "/report/loans/problematic",
                { largeAmountThreshold },
                page,
                size
            ),

        // ---- с параметрами, целиком (controller returns List<T>) ----
        pawnshopLoanStatisticsById: (pawnshopId: number) =>
            api
                .get<PawnshopLoanStatisticsReportDto[]>(`/report/statistics/pawnshop/${pawnshopId}`)
                .then((r) => r.data),
        clientLoanStatistics: (clientId: number) =>
            api
                .get<ClientLoanStatisticsReportDto[]>(`/report/clients/${clientId}/loans/statistics`)
                .then((r) => r.data),
    };
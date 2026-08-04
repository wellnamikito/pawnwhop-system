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

/**
 * ============================================================================
 *  MOCK MODE — for frontend-only testing before the Spring Boot backend
 *  exposes real endpoints. Enabled via VITE_MOCK_API=true in .env.
 *
 *  This file has no effect once VITE_MOCK_API is unset/false — every
 *  service in endpoints.ts falls back to real axios calls to VITE_API_BASE_URL.
 * ============================================================================
 */

export const MOCK_ENABLED = import.meta.env.VITE_MOCK_API === "true";

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// ---------- seed data ----------

let districts: District[] = [
  { district_id: 1, district_name: "Центральный" },
  { district_id: 2, district_name: "Северный" },
  { district_id: 3, district_name: "Южный" },
];

let ownershipTypes: OwnershipType[] = [
  { ownership_type_id: 1, type_name: "Частный" },
  { ownership_type_id: 2, type_name: "ООО" },
  { ownership_type_id: 3, type_name: "ЗАО" },
];

let ownerTypes: OwnerType[] = [
  { owner_type_id: 1, type_name: "Физическое лицо" },
  { owner_type_id: 2, type_name: "Юридическое лицо" },
];

let socialStatuses: SocialStatus[] = [
  { social_status_id: 1, status_name: "Рабочий" },
  { social_status_id: 2, status_name: "Служащий" },
  { social_status_id: 3, status_name: "Предприниматель" },
  { social_status_id: 4, status_name: "Домохозяйка" },
];

let pledgeItemTypes: PledgeItemType[] = [
  { item_type_id: 1, type_name: "Часы" },
  { item_type_id: 2, type_name: "Ювелирное изделие" },
  { item_type_id: 3, type_name: "Картина" },
  { item_type_id: 4, type_name: "Бытовая техника" },
];

let owners: Owner[] = [
  { owner_id: 1, last_name: "Смирнов", first_name: "Иван", middle_name: "Петрович", owner_type_id: 1, phone: "+79161234567" },
  { owner_id: 2, last_name: "ООО Ломбард", first_name: "Плюс", owner_type_id: 2, phone: "+79267654321" },
];

let pawnshops: Pawnshop[] = [
  {
    pawnshop_id: 1,
    name: "Ломбард «Надёжный»",
    ownership_type_id: 1,
    owner_id: 1,
    district_id: 1,
    address: "ул. Ленина, 10",
    phone: "+74951234567",
    opening_hour: 9,
    closing_hour: 20,
  },
  {
    pawnshop_id: 2,
    name: "Ломбард Плюс",
    ownership_type_id: 2,
    owner_id: 2,
    district_id: 2,
    address: "пр. Мира, 45",
    phone: "+74959876543",
    opening_hour: 10,
    closing_hour: 19,
  },
];

let clients: Client[] = [
  {
    client_id: 1,
    last_name: "Иванов",
    first_name: "Пётр",
    middle_name: "Сергеевич",
    birth_date: "1985-04-12",
    social_status_id: 1,
    address: "ул. Гагарина, 3, кв. 5",
    phone: "+79031112233",
  },
  {
    client_id: 2,
    last_name: "Кузнецова",
    first_name: "Мария",
    middle_name: "Андреевна",
    birth_date: "1992-11-02",
    social_status_id: 3,
    address: "ул. Советская, 21",
    phone: "+79045556677",
  },
];

let loans: Loan[] = [
  {
    loan_id: 1,
    pawnshop_id: 1,
    client_id: 1,
    amount: 15000,
    issue_date: "2026-06-01",
    return_date: "2026-07-01",
    penalty_percent: 1,
    is_returned: false,
  },
  {
    loan_id: 2,
    pawnshop_id: 2,
    client_id: 2,
    amount: 8000,
    issue_date: "2026-07-10",
    return_date: "2026-08-10",
    penalty_percent: 0.5,
    is_returned: true,
  },
];

let loanItems: LoanItem[] = [
  { loan_id: 1, item_type_id: 1, item_description: "Наручные часы Ролекс", item_value: 20000 },
  { loan_id: 1, item_type_id: 2, item_description: "Золотое кольцо, 585 пр.", item_value: 5000 },
  { loan_id: 2, item_type_id: 4, item_description: "Ноутбук Lenovo", item_value: 9000 },
];

let users: AppUser[] = [
  { username: "admin", full_name: "Администратор Системы", role: "ADMIN" },
  { username: "operator", full_name: "Оператор Иванова", role: "OPERATOR" },
];

// ---------- generic in-memory CRUD helper ----------

function makeStore<T extends Record<string, any>>(
  getArr: () => T[],
  setArr: (v: T[]) => void,
  idField: keyof T,
  nextId: () => number
) {
  return {
    list: () => delay([...getArr()]),
    get: (id: number) => delay(getArr().find((r) => r[idField] === id) ?? null),
    create: (payload: Partial<T>) => {
      const row = { ...payload, [idField]: nextId() } as T;
      setArr([...getArr(), row]);
      return delay(row);
    },
    update: (id: number, payload: Partial<T>) => {
      const arr = getArr().map((r) => (r[idField] === id ? { ...r, ...payload } : r));
      setArr(arr);
      return delay(arr.find((r) => r[idField] === id) as T);
    },
    remove: (id: number) => {
      setArr(getArr().filter((r) => r[idField] !== id));
      return delay(undefined);
    },
  };
}

let districtSeq = 4;
let ownershipSeq = 4;
let ownerTypeSeq = 3;
let socialSeq = 5;
let itemTypeSeq = 5;
let ownerSeq = 3;
let pawnshopSeq = 3;
let clientSeq = 3;
let loanSeq = 3;

export const mockDistrictApi = makeStore(() => districts, (v) => (districts = v), "district_id", () => districtSeq++);
export const mockOwnershipTypeApi = makeStore(() => ownershipTypes, (v) => (ownershipTypes = v), "ownership_type_id", () => ownershipSeq++);
export const mockOwnerTypeApi = makeStore(() => ownerTypes, (v) => (ownerTypes = v), "owner_type_id", () => ownerTypeSeq++);
export const mockSocialStatusApi = makeStore(() => socialStatuses, (v) => (socialStatuses = v), "social_status_id", () => socialSeq++);
export const mockPledgeItemTypeApi = makeStore(() => pledgeItemTypes, (v) => (pledgeItemTypes = v), "item_type_id", () => itemTypeSeq++);
export const mockOwnerApi = makeStore(() => owners, (v) => (owners = v), "owner_id", () => ownerSeq++);
export const mockPawnshopApi = makeStore(() => pawnshops, (v) => (pawnshops = v), "pawnshop_id", () => pawnshopSeq++);
export const mockClientApi = makeStore(() => clients, (v) => (clients = v), "client_id", () => clientSeq++);
export const mockLoanApi = makeStore(() => loans, (v) => (loans = v), "loan_id", () => loanSeq++);

export const mockLoanItemApi = {
  listForLoan: (loanId: number) => delay(loanItems.filter((i) => i.loan_id === loanId)),
  getWithItems: (loanId: number) => {
    const loan = loans.find((l) => l.loan_id === loanId);
    return delay({ ...(loan as Loan), items: loanItems.filter((i) => i.loan_id === loanId) });
  },
  add: (loanId: number, payload: Partial<LoanItem>) => {
    const row = { loan_id: loanId, ...payload } as LoanItem;
    loanItems = [...loanItems, row];
    return delay(row);
  },
  update: (loanId: number, itemTypeId: number, payload: Partial<LoanItem>) => {
    loanItems = loanItems.map((i) =>
      i.loan_id === loanId && i.item_type_id === itemTypeId ? { ...i, ...payload } : i
    );
    return delay(loanItems.find((i) => i.loan_id === loanId && i.item_type_id === itemTypeId) as LoanItem);
  },
  remove: (loanId: number, itemTypeId: number) => {
    loanItems = loanItems.filter((i) => !(i.loan_id === loanId && i.item_type_id === itemTypeId));
    return delay(undefined);
  },
};

// ---------- mock auth ----------
// Any password works. Username decides the role, so you can test all three
// permission levels without a real backend:
//   admin    -> ADMIN
//   operator -> OPERATOR
//   analyst  -> ANALYST
export const mockAuthApi = {
  login: (username: string) => {
    const found = users.find((u) => u.username === username.trim().toLowerCase());
    const user: AppUser = found ?? {
      username: username || "analyst",
      full_name: "Демо Аналитик",
      role: "ANALYST",
    };
    return delay({ token: "mock-token", user });
  },
  me: () => delay(users[0]),
};

// ---------- mock reports ----------
// Matches the real backend's report DTOs (see ReportController) for the 3
// endpoints wired up in ReportsPage - so mock mode and real mode render
// identically once you flip VITE_MOCK_API off.
export const mockReportApi = {
  loansCountByClient: () => {
    const rows = clients.map((c) => ({
      clientId: c.client_id,
      name: c.last_name,
      fistName: c.first_name,
      loanCount: loans.filter((l) => l.client_id === c.client_id).length,
    }));
    return delay(rows.filter((r) => r.loanCount > 0));
  },
  pawnshopLoanShare: () => {
    const totalAll = loans.reduce((sum, l) => sum + Number(l.amount), 0) || 1;
    const rows = pawnshops.map((p) => {
      const pawnshopTotal = loans
        .filter((l) => l.pawnshop_id === p.pawnshop_id)
        .reduce((sum, l) => sum + Number(l.amount), 0);
      return {
        pawnshopId: p.pawnshop_id,
        name: p.name,
        pawnshopTotal,
        percentOfTotal: Math.round((pawnshopTotal / totalAll) * 1000) / 10,
      };
    });
    return delay(rows.filter((r) => r.pawnshopTotal > 0));
  },
  overdueLoans: (reportDate: string) => {
    const rows = loans
      .filter((l) => !l.is_returned && l.return_date && l.return_date < reportDate)
      .map((l) => {
        const client = clients.find((c) => c.client_id === l.client_id);
        return {
          loanId: l.loan_id,
          lastName: client?.last_name ?? "—",
          phone: client?.phone ?? "—",
          returnDate: l.return_date as string,
        };
      });
    return delay(rows);
  },
};

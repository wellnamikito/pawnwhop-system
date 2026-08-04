import type {
  Client,
  District,
  Loan,
  LoanItem,
  Owner,
  OwnerType,
  OwnershipType,
  Pawnshop,
  PledgeItemType,
  Role,
  SocialStatus,
} from "@/types";

/**
 * ============================================================================
 *  BACKEND CONTRACT ADAPTER
 * ============================================================================
 * The real Spring Boot backend (com.pawnhop.backend) uses:
 *   - camelCase JSON fields (lastName, ownerTypeId, ...) instead of the
 *     snake_case used internally by this frontend (last_name, owner_type_id)
 *   - generic {id, name} shape for the 5 dictionary tables
 *   - IMPORTANT: Owner/Pawnshop/Client/Loan *response* DTOs return foreign
 *     keys as already-resolved display strings (e.g. Pawnshop.owner =
 *     "Смирнов Иван Петрович"), NOT as numeric ids. Only the *request* DTOs
 *     (create/update) take numeric ids.
 *
 * This means read-only views (list/search/filter) work perfectly, but
 * pre-filling the correct <select> option when opening an "edit" modal has
 * to fall back to matching the returned display string against the loaded
 * dictionary/reference lists. This is a best-effort match, done here in one
 * place so the rest of the app is unaffected.
 *
 * ⚠️ Recommended backend fix (see chat): add the raw *Id fields (e.g.
 * ownerTypeId, ownerId, districtId, socialStatusId, pawnshopId, clientId)
 * alongside the existing display-name fields in every *ResponseDto. That
 * removes the need for this whole "match by name" section and is a small,
 * mechanical change (the ids are already available in the entity/service
 * layer - see e.g. PawnshopServiceImpl.mapToResponse).
 * ============================================================================
 */

// ---------- generic {id, name} dictionaries ----------

export interface DictionaryDto {
  id: number;
  name: string;
}

export function toDistrict(d: DictionaryDto): District {
  return { district_id: d.id, district_name: d.name };
}
export function toOwnershipType(d: DictionaryDto): OwnershipType {
  return { ownership_type_id: d.id, type_name: d.name };
}
export function toOwnerType(d: DictionaryDto): OwnerType {
  return { owner_type_id: d.id, type_name: d.name };
}
export function toSocialStatus(d: DictionaryDto): SocialStatus {
  return { social_status_id: d.id, status_name: d.name };
}
export function toPledgeItemType(d: DictionaryDto): PledgeItemType {
  return { item_type_id: d.id, type_name: d.name };
}

// ---------- name-matching helpers (see warning above) ----------

function norm(s?: string | null): string {
  return (s ?? "").replace(/\s+/g, " ").trim().toLowerCase();
}

// Mirrors the exact string the backend builds in PawnshopServiceImpl /
// LoanServiceImpl: `lastName + " " + firstName + " " + middleName` - if
// middleName is null, Java's string concatenation literally produces the
// text "null", so we reproduce that here to get a matching string.
function ownerLabel(o: Owner): string {
  return norm(`${o.last_name} ${o.first_name} ${o.middle_name ?? "null"}`);
}
function clientLabel(c: Client): string {
  return norm(`${c.last_name} ${c.first_name} ${c.middle_name ?? "null"}`);
}

function findIdByName<T>(list: T[], getName: (t: T) => string, target: string, getId: (t: T) => number): number {
  const found = list.find((item) => getName(item) === norm(target));
  return found ? getId(found) : 0; // 0 = "not matched", caller should treat as unresolved
}

// ---------- Owner ----------

export interface OwnerDto {
  id: number;
  lastName: string;
  firstName: string;
  middleName?: string | null;
  ownerType: string; // resolved display name, not id
  phone?: string | null;
}

export function toOwner(dto: OwnerDto, ownerTypes: OwnerType[]): Owner {
  return {
    owner_id: dto.id,
    last_name: dto.lastName,
    first_name: dto.firstName,
    middle_name: dto.middleName,
    owner_type_id: findIdByName(ownerTypes, (t) => norm(t.type_name), dto.ownerType, (t) => t.owner_type_id),
    phone: dto.phone,
  };
}

export function toOwnerRequest(input: Partial<Owner>) {
  return {
    lastName: input.last_name,
    firstName: input.first_name,
    middleName: input.middle_name ?? null,
    ownerTypeId: input.owner_type_id,
    phone: input.phone,
  };
}

// ---------- Pawnshop ----------

export interface PawnshopDto {
  id: number;
  name: string;
  ownershipType: string;
  owner: string;
  district: string;
  address: string;
  phone?: string | null;
  openingHour?: number | null;
  closingHour?: number | null;
}

export function toPawnshop(
  dto: PawnshopDto,
  dicts: { ownershipTypes: OwnershipType[]; districts: District[]; owners: Owner[] }
): Pawnshop {
  return {
    pawnshop_id: dto.id,
    name: dto.name,
    ownership_type_id: findIdByName(
      dicts.ownershipTypes,
      (t) => norm(t.type_name),
      dto.ownershipType,
      (t) => t.ownership_type_id
    ),
    owner_id: findIdByName(dicts.owners, ownerLabel, dto.owner, (o) => o.owner_id),
    district_id: findIdByName(dicts.districts, (d) => norm(d.district_name), dto.district, (d) => d.district_id),
    address: dto.address,
    phone: dto.phone,
    opening_hour: dto.openingHour,
    closing_hour: dto.closingHour,
  };
}

export function toPawnshopRequest(input: Partial<Pawnshop>) {
  return {
    name: input.name,
    ownershipTypeId: input.ownership_type_id,
    ownerId: input.owner_id,
    districtId: input.district_id,
    address: input.address,
    phone: input.phone,
    openingHour: input.opening_hour,
    closingHour: input.closing_hour,
  };
}

// ---------- Client ----------

export interface ClientDto {
  clientId: number;
  lastName: string;
  firstName: string;
  middleName?: string | null;
  birthDate?: string | null;
  socialStatus: string;
  address?: string | null;
  phone?: string | null;
}

export function toClient(dto: ClientDto, socialStatuses: SocialStatus[]): Client {
  return {
    client_id: dto.clientId,
    last_name: dto.lastName,
    first_name: dto.firstName,
    middle_name: dto.middleName,
    birth_date: dto.birthDate,
    social_status_id: findIdByName(
      socialStatuses,
      (s) => norm(s.status_name),
      dto.socialStatus,
      (s) => s.social_status_id
    ),
    address: dto.address,
    phone: dto.phone,
  };
}

export function toClientRequest(input: Partial<Client>) {
  return {
    lastName: input.last_name,
    firstName: input.first_name,
    middleName: input.middle_name ?? null,
    birthDate: input.birth_date,
    socialStatusId: input.social_status_id,
    address: input.address,
    phone: input.phone,
  };
}

// ---------- Loan ----------
// NOTE: LoanResponseDto has a Java field named "Loanid" (typo - should be
// "loanId"); Lombok's generated getter serializes it to the JSON key
// "loanid" (all lowercase). Recommend renaming the field on the backend.
export interface LoanDto {
  loanid: number;
  pawnshop: string;
  client: string;
  amount: number;
  issueDate: string;
  returnDate?: string | null;
  penaltyPercent?: number | null;
  isReturned: boolean;
}

export function toLoan(dto: LoanDto, dicts: { pawnshops: Pawnshop[]; clients: Client[] }): Loan {
  return {
    loan_id: dto.loanid,
    pawnshop_id: findIdByName(dicts.pawnshops, (p) => norm(p.name), dto.pawnshop, (p) => p.pawnshop_id),
    client_id: findIdByName(dicts.clients, clientLabel, dto.client, (c) => c.client_id),
    amount: Number(dto.amount),
    issue_date: dto.issueDate,
    return_date: dto.returnDate,
    penalty_percent: dto.penaltyPercent != null ? Number(dto.penaltyPercent) : null,
    is_returned: dto.isReturned,
  };
}

export function toLoanRequest(input: Partial<Loan>) {
  return {
    pawnshopId: input.pawnshop_id,
    clientId: input.client_id,
    amount: input.amount,
    issueDate: input.issue_date,
    returnDate: input.return_date || null,
    penaltyPercent: input.penalty_percent,
    isReturned: !!input.is_returned,
  };
}

// ---------- LoanItem ----------
// Unlike the entities above, LoanItemResponseDto DOES return itemTypeId as
// a real numeric id, so no name-matching is needed here.

export interface LoanItemDto {
  loanId: number;
  itemTypeId: number;
  itemTypeName: string;
  itemDescription?: string | null;
  itemValue: number;
}

export function toLoanItem(dto: LoanItemDto): LoanItem {
  return {
    loan_id: dto.loanId,
    item_type_id: dto.itemTypeId,
    item_description: dto.itemDescription,
    item_value: Number(dto.itemValue),
  };
}

export function toLoanItemRequest(loanId: number, input: Partial<LoanItem>) {
  return {
    loanId,
    itemTypeId: input.item_type_id,
    itemDescription: input.item_description,
    itemValue: input.item_value,
  };
}

// ---------- Auth ----------
// Backend authenticates against real PostgreSQL roles (see
// PostgreSQLAuthService) and returns role strings like "admin_role" /
// "operator_role" / "analyst_role", not the "ADMIN" / "OPERATOR" / "ANALYST"
// enum values used internally here.

export function normalizeRole(raw: string): Role {
  const upper = raw.replace(/_role$/i, "").toUpperCase();
  if (upper === "ADMIN" || upper === "OPERATOR" || upper === "ANALYST") return upper;
  return "ANALYST"; // safest fallback: least privilege
}

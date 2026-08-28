import type {
    ClientDto,
    DictionaryDto,
    LoanDto,
    LoanItemDto,
    OwnerDto,
    PageDto,
    PawnshopDto,
} from "./contracts";

import type {
    Client,
    DictionaryItem,
    Loan,
    LoanItem,
    Owner,
    PageResult,
    Pawnshop,
} from "./models";

function requiredId(value: unknown, entityName: string): number {
    const id = Number(value);

    if (!Number.isInteger(id) || id <= 0) {
        throw new Error(`API вернул некорректный идентификатор: ${entityName}`);
    }

    return id;
}

function optionalNumber(value: number | string | null | undefined): number | null {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : null;
}

function fullName(
    lastName: string,
    firstName: string,
    middleName: string | null,
) {
    return [lastName, firstName, middleName].filter(Boolean).join(" ");
}

export function toDictionary(dto: DictionaryDto): DictionaryItem {
    return {
        id: requiredId(dto.id, "справочник"),
        name: dto.name,
    };
}

export function toClient(dto: ClientDto): Client {
    return {
        id: requiredId(dto.clientId, "клиент"),
        lastName: dto.lastName,
        firstName: dto.firstName,
        middleName: dto.middleName,
        fullName: fullName(dto.lastName, dto.firstName, dto.middleName),
        birthDate: dto.birthDate,
        socialStatus: dto.socialStatus,
        address: dto.address,
        phone: dto.phone,
    };
}

export function toOwner(dto: OwnerDto): Owner {
    return {
        id: requiredId(dto.id, "владелец"),
        lastName: dto.lastName,
        firstName: dto.firstName,
        middleName: dto.middleName,
        fullName: fullName(dto.lastName, dto.firstName, dto.middleName),
        ownerType: dto.ownerType,
        phone: dto.phone,
    };
}

export function toPawnshop(dto: PawnshopDto): Pawnshop {
    return {
        id: requiredId(dto.id, "ломбард"),
        name: dto.name,
        ownershipType: dto.ownershipType,
        owner: dto.owner,
        district: dto.district,
        address: dto.address,
        phone: dto.phone,
        openingHour: dto.openingHour,
        closingHour: dto.closingHour,
    };
}

export function toLoan(dto: LoanDto): Loan {
    const rawId = dto.loanId ?? dto.loanid ?? dto.Loanid ?? dto.loan_id;

    return {
        id: requiredId(rawId, "ссуда"),
        pawnshop: dto.pawnshop,
        client: dto.client,
        amount: Number(dto.amount),
        issueDate: dto.issueDate,
        returnDate: dto.returnDate,
        penaltyPercent: optionalNumber(dto.penaltyPercent),
        isReturned: Boolean(dto.isReturned),
    };
}

export function toLoanItem(dto: LoanItemDto): LoanItem {
    return {
        loanId: requiredId(dto.loanId, "ссуда"),
        itemTypeId: requiredId(dto.itemTypeId, "тип залога"),
        itemTypeName: dto.itemTypeName,
        itemDescription: dto.itemDescription,
        itemValue: Number(dto.itemValue),
    };
}

export function toPage<TDto, TModel>(
    dto: PageDto<TDto>,
    normalize: (item: TDto) => TModel,
): PageResult<TModel> {
    const metadata = dto.page ?? dto;

    return {
        content: dto.content.map(normalize),
        page: metadata.number ?? 0,
        totalPages: Math.max(metadata.totalPages ?? 1, 1),
        totalElements: metadata.totalElements ?? dto.content.length,
    };
}
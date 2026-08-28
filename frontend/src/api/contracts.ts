export interface DictionaryDto {
    id: number;
    name: string;
}

export interface ClientDto {
    clientId: number;
    lastName: string;
    firstName: string;
    middleName: string | null;
    birthDate: string | null;
    socialStatus: string | null;
    address: string | null;
    phone: string | null;
}

export interface OwnerDto {
    id: number;
    lastName: string;
    firstName: string;
    middleName: string | null;
    ownerType: string | null;
    phone: string | null;
}

export interface PawnshopDto {
    id: number;
    name: string;
    ownershipType: string | null;
    owner: string | null;
    district: string | null;
    address: string;
    phone: string | null;
    openingHour: number | null;
    closingHour: number | null;
}

export interface LoanDto {
    loanId?: number;
    loanid?: number;
    Loanid?: number;
    loan_id?: number;
    pawnshop: string;
    client: string;
    amount: number | string;
    issueDate: string | null;
    returnDate: string | null;
    penaltyPercent: number | string | null;
    isReturned: boolean | null;
}

export interface LoanItemDto {
    loanId: number;
    itemTypeId: number;
    itemTypeName: string;
    itemDescription: string | null;
    itemValue: number | string;
}

export interface PageDto<T> {
    content: T[];
    number?: number;
    totalPages?: number;
    totalElements?: number;
    page?: {
        number?: number;
        totalPages?: number;
        totalElements?: number;
    };
}

export interface DictionaryWriteDto {
    name: string;
}

export interface ClientWriteDto {
    lastName: string;
    firstName: string;
    middleName: string | null;
    birthDate: string | null;
    socialStatusId: number;
    address: string;
    phone: string;
}

export interface OwnerWriteDto {
    lastName: string;
    firstName: string;
    middleName: string | null;
    ownerTypeId: number;
    phone: string;
}

export interface PawnshopWriteDto {
    name: string;
    ownershipTypeId: number;
    ownerId: number;
    districtId: number;
    address: string;
    phone: string | null;
    openingHour: number | null;
    closingHour: number | null;
}

export interface LoanWriteDto {
    pawnshopId: number;
    clientId: number;
    amount: number;
    issueDate: string | null;
    returnDate: string | null;
    penaltyPercent: number | null;
    isReturned: boolean;
}

export interface LoanItemWriteDto {
    loanId: number;
    itemTypeId: number;
    itemDescription: string;
    itemValue: number;
}
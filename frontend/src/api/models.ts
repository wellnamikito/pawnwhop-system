export interface DictionaryItem {
    id: number;
    name: string;
}

export interface Client {
    id: number;
    lastName: string;
    firstName: string;
    middleName: string | null;
    fullName: string;
    birthDate: string | null;
    socialStatus: string | null;
    address: string | null;
    phone: string | null;
}

export interface Owner {
    id: number;
    lastName: string;
    firstName: string;
    middleName: string | null;
    fullName: string;
    ownerType: string | null;
    phone: string | null;
}

export interface Pawnshop {
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

export interface Loan {
    id: number;
    pawnshop: string;
    client: string;
    amount: number;
    issueDate: string | null;
    returnDate: string | null;
    penaltyPercent: number | null;
    isReturned: boolean;
}

export interface LoanItem {
    loanId: number;
    itemTypeId: number;
    itemTypeName: string;
    itemDescription: string | null;
    itemValue: number;
}

export interface PageResult<T> {
    content: T[];
    page: number;
    totalPages: number;
    totalElements: number;
}
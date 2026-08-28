export interface Loan {
    loanId: number;
    pawnshop: string;
    client: string;
    amount: number;
    issueDate: string | null;
    returnDate: string | null;
    penaltyPercent: number | null;
    isReturned: boolean | null;
}

export interface ClientOption {
    clientId: number;
    lastName: string;
    firstName: string;
    middleName: string | null;
}

export interface PawnshopOption {
    id: number;
    name: string;
}

export interface PledgeItemType {
    id: number;
    name: string;
}

export interface LoanItem {
    loanId: number;
    itemTypeId: number;
    itemTypeName: string;
    itemDescription: string;
    itemValue: number;
}

export interface LoanPayload {
    pawnshopId: number;
    clientId: number;
    amount: number;
    issueDate: string | null;
    returnDate: string | null;
    penaltyPercent: number | null;
    isReturned: boolean;
}

export interface LoanItemPayload {
    loanId: number;
    itemTypeId: number;
    itemDescription: string;
    itemValue: number;
}
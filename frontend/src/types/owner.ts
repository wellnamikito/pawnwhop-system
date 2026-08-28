export interface Owner {
    id: number;
    lastName: string;
    firstName: string;
    middleName?: string;
    ownerType: string;
    phone?: string;
}

export interface OwnerRequest {
    lastName: string;
    firstName: string;
    middleName?: string;
    ownerTypeId: number;
    phone: string;
}
export interface Client {
    clientId: number;

    lastName: string;
    firstName: string;
    middleName?: string;

    birthDate?: string;

    socialStatus: string;

    address: string;

    phone: string;
}

export interface ClientRequest {
    lastName: string;
    firstName: string;
    middleName?: string;

    birthDate?: string;

    socialStatusId: number;

    address: string;

    phone: string;
}
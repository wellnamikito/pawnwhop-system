import api from "./client";
import type {
    ClientDto,
    ClientWriteDto,
    DictionaryDto,
    DictionaryWriteDto,
    LoanDto,
    LoanItemDto,
    LoanItemWriteDto,
    LoanWriteDto,
    OwnerDto,
    OwnerWriteDto,
    PageDto,
    PawnshopDto,
    PawnshopWriteDto,
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

import {
    toClient,
    toDictionary,
    toLoan,
    toLoanItem,
    toOwner,
    toPage,
    toPawnshop,
} from "./normalizers";

function createCrudApi<TDto, TModel, TWrite>(
    path: string,
    normalize: (dto: TDto) => TModel,
) {
    return {
        async list(): Promise<TModel[]> {
            const response = await api.get<TDto[]>(path);
            return response.data.map(normalize);
        },

        async get(id: number): Promise<TModel> {
            const response = await api.get<TDto>(`${path}/${id}`);
            return normalize(response.data);
        },

        async create(payload: TWrite): Promise<TModel> {
            const response = await api.post<TDto>(path, payload);
            return normalize(response.data);
        },

        async update(id: number, payload: TWrite): Promise<TModel> {
            const response = await api.put<TDto>(`${path}/${id}`, payload);
            return normalize(response.data);
        },

        async remove(id: number): Promise<void> {
            await api.delete(`${path}/${id}`);
        },
    };
}

const districtsApi = createCrudApi<DictionaryDto, DictionaryItem, DictionaryWriteDto>(
    "/districts",
    toDictionary,
);

const ownerTypesApi = createCrudApi<DictionaryDto, DictionaryItem, DictionaryWriteDto>(
    "/owner-types",
    toDictionary,
);

const ownershipTypesApi = createCrudApi<DictionaryDto, DictionaryItem, DictionaryWriteDto>(
    "/ownership-types",
    toDictionary,
);

const socialStatusesApi = createCrudApi<DictionaryDto, DictionaryItem, DictionaryWriteDto>(
    "/social-statuses",
    toDictionary,
);

const pledgeItemTypesApi = createCrudApi<DictionaryDto, DictionaryItem, DictionaryWriteDto>(
    "/pledge-item-types",
    toDictionary,
);

export const dictionariesApi = {
    districts: districtsApi,
    ownerTypes: ownerTypesApi,
    ownershipTypes: ownershipTypesApi,
    socialStatuses: socialStatusesApi,
    pledgeItemTypes: pledgeItemTypesApi,
};

export const clientsApi = createCrudApi<ClientDto, Client, ClientWriteDto>(
    "/clients",
    toClient,
);

export const ownersApi = createCrudApi<OwnerDto, Owner, OwnerWriteDto>(
    "/owners",
    toOwner,
);

export const pawnshopsApi = createCrudApi<PawnshopDto, Pawnshop, PawnshopWriteDto>(
    "/pawnshops",
    toPawnshop,
);

export const loansApi = {
    async listPage(page = 0, size = 50): Promise<PageResult<Loan>> {
        const response = await api.get<PageDto<LoanDto>>("/loans/page", {
            params: { page, size },
        });

        return toPage(response.data, toLoan);
    },

    async get(id: number): Promise<Loan> {
        const response = await api.get<LoanDto>(`/loans/${id}`);
        return toLoan(response.data);
    },

    async create(payload: LoanWriteDto): Promise<Loan> {
        const response = await api.post<LoanDto>("/loans", payload);
        return toLoan(response.data);
    },

    async update(id: number, payload: LoanWriteDto): Promise<Loan> {
        const response = await api.put<LoanDto>(`/loans/${id}`, payload);
        return toLoan(response.data);
    },

    async remove(id: number): Promise<void> {
        await api.delete(`/loans/${id}`);
    },
};

export const loanItemsApi = {
    async listForLoan(loanId: number): Promise<LoanItem[]> {
        const response = await api.get<LoanItemDto[]>(`/loans/${loanId}/items`);
        return response.data.map(toLoanItem);
    },

    async create(loanId: number, payload: LoanItemWriteDto): Promise<LoanItem> {
        const response = await api.post<LoanItemDto>(`/loans/${loanId}/items`, payload);
        return toLoanItem(response.data);
    },

    async update(
        loanId: number,
        itemTypeId: number,
        payload: LoanItemWriteDto,
    ): Promise<LoanItem> {
        const response = await api.put<LoanItemDto>(
            `/loans/${loanId}/items/${itemTypeId}`,
            payload,
        );

        return toLoanItem(response.data);
    },

    async remove(loanId: number, itemTypeId: number): Promise<void> {
        await api.delete(`/loans/${loanId}/items/${itemTypeId}`);
    },
};
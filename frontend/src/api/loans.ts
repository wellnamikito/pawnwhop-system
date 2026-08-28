import api from "@/api/client";

import type {
    ClientOption,
    Loan,
    LoanItem,
    LoanItemPayload,
    LoanPayload,
    PawnshopOption,
    PledgeItemType,
} from "@/types/loan";

export interface LoanPage {
    content: Loan[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

export interface ClientPage {
    content: ClientOption[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

export const loanApi = {
    getPage: async (
        page = 0,
        size = 50,
        search?: string
    ): Promise<LoanPage> => {
        const response = await api.get<LoanPage>(
            "/loans/page",
            {
                params: {
                    page,
                    size,
                    search: search || undefined,
                },
            }
        );

        return response.data;
    },

    list: async (): Promise<Loan[]> => {
        const response = await api.get<Loan[]>(
            "/loans"
        );

        return response.data;
    },

    create: async (
        payload: LoanPayload
    ): Promise<Loan> => {
        // Бэкенд ожидает snake_case (is_returned), а не camelCase (isReturned)
        const backendPayload = {
            pawnshopId: payload.pawnshopId,
            clientId: payload.clientId,
            amount: payload.amount,
            issueDate: payload.issueDate,
            returnDate: payload.returnDate,
            penaltyPercent: payload.penaltyPercent,
            isReturned: payload.isReturned, // <--- КЛЮЧЕВОЕ ИЗМЕНЕНИЕ!
        };

        console.log("CREATE - Отправляем на бэкенд:", JSON.stringify(backendPayload, null, 2));

        const response = await api.post<Loan>(
            "/loans",
            backendPayload
        );

        return response.data;
    },

    update: async (
        loanId: number,
        payload: LoanPayload
    ): Promise<Loan> => {
        // Бэкенд ожидает snake_case (is_returned), а не camelCase (isReturned)
        const backendPayload = {
            pawnshopId: payload.pawnshopId,
            clientId: payload.clientId,
            amount: payload.amount,
            issueDate: payload.issueDate,
            returnDate: payload.returnDate,
            penaltyPercent: payload.penaltyPercent,
            isReturned: payload.isReturned, // <--- КЛЮЧЕВОЕ ИЗМЕНЕНИЕ!
        };

        console.log("UPDATE - Отправляем на бэкенд:", JSON.stringify(backendPayload, null, 2));
        console.log("UPDATE - loanId:", loanId);

        const response = await api.put<Loan>(
            `/loans/${loanId}`,
            backendPayload
        );

        return response.data;
    },

    remove: async (
        loanId: number
    ): Promise<void> => {
        await api.delete(
            `/loans/${loanId}`
        );
    },
};

export const loanItemApi = {
    list: async (
        loanId: number
    ): Promise<LoanItem[]> => {
        const response = await api.get<LoanItem[]>(
            `/loans/${loanId}/items`
        );

        return response.data;
    },

    create: async (
        loanId: number,
        payload: LoanItemPayload
    ): Promise<LoanItem> => {
        const response = await api.post<LoanItem>(
            `/loans/${loanId}/items`,
            payload
        );

        return response.data;
    },

    update: async (
        loanId: number,
        itemTypeId: number,
        payload: LoanItemPayload
    ): Promise<LoanItem> => {
        const response = await api.put<LoanItem>(
            `/loans/${loanId}/items/${itemTypeId}`,
            payload
        );

        return response.data;
    },

    remove: async (
        loanId: number,
        itemTypeId: number
    ): Promise<void> => {
        await api.delete(
            `/loans/${loanId}/items/${itemTypeId}`
        );
    },
};

/*
 * ВАЖНО:
 *
 * Здесь НЕТ:
 *
 * api.get<ClientOption[]>("/clients")
 *
 * потому что /clients возвращает все 200 002 записи.
 *
 * Вместо этого используем пагинацию.
 */

export const clientOptionApi = {
    getPage: async (
        page = 0,
        size = 50,
        search?: string
    ): Promise<ClientPage> => {
        const response = await api.get<ClientPage>(
            "/clients/page",
            {
                params: {
                    page,
                    size,
                    search: search || undefined,
                },
            }
        );

        return response.data;
    },
};

export async function loadLoanDictionaries() {
    const [
        pawnshops,
        itemTypes,
    ] = await Promise.all([
        api.get<PawnshopOption[]>(
            "/pawnshops"
        ),

        api.get<PledgeItemType[]>(
            "/pledge-item-types"
        ),
    ]);

    /*
     * Клиенты здесь больше НЕ загружаются.
     *
     * Они будут загружаться отдельно
     * небольшими страницами через clientOptionApi.
     */

    return {
        pawnshops: pawnshops.data,
        itemTypes: itemTypes.data,
    };
}
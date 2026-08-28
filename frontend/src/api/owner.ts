import api from "@/api/client";

import type {
    Owner,
    OwnerRequest,
} from "@/types/owner";

export interface OwnerPage {
    content: Owner[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

export const ownerApi = {
    getAll: async (
        page = 0,
        size = 50,
        search?: string
    ): Promise<OwnerPage> => {
        const response =
            await api.get<OwnerPage>(
                "/owners/page",
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

    create: async (
        data: OwnerRequest
    ): Promise<Owner> => {
        const response =
            await api.post<Owner>(
                "/owners",
                data
            );

        return response.data;
    },

    update: async (
        id: number,
        data: OwnerRequest
    ): Promise<Owner> => {
        const response =
            await api.put<Owner>(
                `/owners/${id}`,
                data
            );

        return response.data;
    },

    remove: async (
        id: number
    ): Promise<void> => {
        await api.delete(
            `/owners/${id}`
        );
    },
};
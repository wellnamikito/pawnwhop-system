import api from "@/api/client";

import type {
    Dictionary,
    DictionaryRequest,
} from "@/types/dictionary";


function createDictionaryApi(endpoint: string) {

    return {

        getAll: async (): Promise<Dictionary[]> => {

            const response =
                await api.get<Dictionary[]>(endpoint);

            return response.data;
        },


        create: async (
            data: DictionaryRequest
        ): Promise<Dictionary> => {

            const response =
                await api.post<Dictionary>(
                    endpoint,
                    data
                );

            return response.data;
        },


        update: async (
            id: number,
            data: DictionaryRequest
        ): Promise<Dictionary> => {

            const response =
                await api.put<Dictionary>(
                    `${endpoint}/${id}`,
                    data
                );

            return response.data;
        },


        remove: async (
            id: number
        ): Promise<void> => {

            await api.delete(
                `${endpoint}/${id}`
            );
        },
    };
}


export const districtApi =
    createDictionaryApi("/districts");


export const ownershipTypeApi =
    createDictionaryApi("/ownership-types");


export const ownerTypeApi =
    createDictionaryApi("/owner-types");


export const socialStatusApi =
    createDictionaryApi("/social-statuses");


export const pledgeItemTypeApi =
    createDictionaryApi("/pledge-item-types");
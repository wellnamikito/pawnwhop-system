import api from "@/api/client";

import type {
  Client,
  ClientRequest,
} from "@/types/client";

export interface ClientPage {
  content: Client[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const clientsApi = {
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

  create: async (
    data: ClientRequest
  ): Promise<Client> => {
    const response = await api.post<Client>(
      "/clients",
      data
    );

    return response.data;
  },

  update: async (
    id: number,
    data: ClientRequest
  ): Promise<Client> => {
    const response = await api.put<Client>(
      `/clients/${id}`,
      data
    );

    return response.data;
  },

  remove: async (
    id: number
  ): Promise<void> => {
    await api.delete(`/clients/${id}`);
  },
};

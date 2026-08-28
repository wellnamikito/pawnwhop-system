import api from "@/api/client";

import type {
  Pawnshop,
  PawnshopRequest,
} from "@/types/pawnshop";

export interface PawnshopPage {
  content: Pawnshop[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const pawnshopApi = {

  getPage: async (
      page = 0,
      size = 50,
      search?: string
  ): Promise<PawnshopPage> => {

    const response =
        await api.get<PawnshopPage>(
            "/pawnshops/page",
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
      data: PawnshopRequest
  ): Promise<Pawnshop> => {

    const response =
        await api.post<Pawnshop>(
            "/pawnshops",
            data
        );

    return response.data;
  },


  update: async (
      id: number,
      data: PawnshopRequest
  ): Promise<Pawnshop> => {

    const response =
        await api.put<Pawnshop>(
            `/pawnshops/${id}`,
            data
        );

    return response.data;
  },


  remove: async (
      id: number
  ): Promise<void> => {

    await api.delete(
        `/pawnshops/${id}`
    );
  },
};
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { Hono } from "hono";


export type Entry = {
  id: string;
  value: number | string;
  description: string;
  date: string;
  category?: string;
  categoryId?: string;
  payee?: string;
  payeeId?: string;
  payeeType?: string; 
  createdAt: string;
  updatedAt: string;
};

export const useGetEntry = (id?: string) => {
  return useQuery<Entry>({
    queryKey: ["entries", id],
    queryFn: async () => {
      if (!id) throw new Error("ID da entrada é necessário");
      
      const response = await (client as any).api.entries[id].$get();
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Falha ao carregar entrada");
      }
      
      return response.json();
    },
    enabled: !!id,
  });
};

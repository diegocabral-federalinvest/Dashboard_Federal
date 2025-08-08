import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { Hono } from "hono";

export type Investment = {
  id: string;
  value: number | string;
  type: "aporte" | "retirada";
  investorName: string;
  investorId: string;
  description: string;
  date: string;
  startDate: string;
  returnRate: number;
  status: "active" | "completed" | "withdrawn";
  createdAt: string;
  updatedAt: string;
};

export const useGetInvestment = (id?: string) => {
  return useQuery<Investment>({
    queryKey: ["investments", id],
    queryFn: async () => {
      if (!id) throw new Error("ID do investimento é necessário");
      
      const response = await (client as any).api.investments[id].$get();
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Falha ao carregar investimento");
      }
      
      return response.json();
    },
    enabled: !!id,
  });
}; 
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { Hono } from "hono";


export type Expense = {
  id: string;
  value: number | string;
  description: string;
  date: string;
  isTaxable: boolean;
  isPayroll: boolean;
  categoryId?: string;
  category?: string;
  payee?: string;
  payeeId?: string;
  payeeType?: string; 
  createdAt: string;
  updatedAt: string;
};

export const useGetExpense = (id?: string) => {
  return useQuery<Expense>({
    queryKey: ["expenses", id],
    queryFn: async () => {
      if (!id) throw new Error("ID da despesa é necessário");
      
      const response = await (client as any).api.expenses[id].$get();
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Falha ao carregar despesa");
      }
      
      return response.json();
    },
    enabled: !!id,
  });
};

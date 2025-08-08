import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/hono";
import { Expense } from "./use-get-expense";

interface UpdateExpenseData {
  description?: string;
  value?: number | string;
  date?: Date | string;
  isTaxable?: boolean;
}

export const useUpdateExpense = (id?: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateExpenseData) => {
      if (!id) throw new Error("ID é necessário");
      
      // Format the data as needed
      const formattedData = {
        ...data,
        // Convert dates to ISO strings if needed
        date: data.date instanceof Date ? data.date.toISOString() : data.date,
        // Ensure value is a string if it's a number (db expects string)
        value: typeof data.value === 'number' ? String(data.value) : data.value
      };
      
      // Use fetch directly with relative URL instead of Hono client
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Falha ao atualizar despesa");
      }
      
      return response.json();
    },
    onSuccess: (updatedExpense) => {
      toast.success("Despesa atualizada com sucesso!");
      
      // Update the cache with the new data
      queryClient.setQueryData<Expense>(["expenses", id], (oldData) => {
        if (!oldData) return updatedExpense;
        return {
          ...oldData,
          ...updatedExpense,
        };
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: (error) => {
      console.error("Falha ao atualizar despesa:", error);
      toast.error("Erro ao atualizar despesa");
    },
  });
}; 
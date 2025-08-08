import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type CreateExpenseData = {
  value: number;
  description: string;
  date: Date;
  isTaxable: boolean;
  isPayroll: boolean;
  categoryId?: string;
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateExpenseData) => {
      // Format the data as needed
      const formattedData = {
        ...data,
        // Convert dates to ISO strings
        date: data.date instanceof Date ? data.date.toISOString() : data.date,
      };

      // Use fetch directly with relative URL instead of Hono client
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Falha ao criar despesa");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast.success("Despesa criada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: (error) => {
      console.error("Failed to create expense:", error);
      toast.error("Erro ao criar despesa");
    },
  });
}; 
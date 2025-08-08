import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type CreateEntryData = {
  value: number;
  description: string;
  date: Date;
};

export const useCreateEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEntryData) => {
      // Format the data as needed
      const formattedData = {
        ...data,
        // Convert dates to ISO strings
        date: data.date instanceof Date ? data.date.toISOString() : data.date,
      };

      // Use fetch directly with relative URL instead of Hono client
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Falha ao criar entrada");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast.success("Entrada criada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
    onError: (error) => {
      console.error("Falha ao criar entrada:", error);
      toast.error("Erro ao criar entrada");
    },
  });
}; 
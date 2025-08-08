import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/hono";
import { Entry } from "./use-get-entry";

interface UpdateEntryData {
  description?: string;
  value?: number | string;
  date?: Date | string;
}

export const useUpdateEntry = (id?: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateEntryData) => {
      if (!id) throw new Error("ID é necessário");
      
      // Format the data as needed
      const formattedData = {
        ...data,
        // Convert dates to ISO strings if needed
        date: data.date instanceof Date ? data.date.toISOString() : data.date,
        // Ensure value is a string if it's a number (db expects string)
        value: typeof data.value === 'number' ? String(data.value) : data.value
      };
      
      const response = await (client as any).api.entries[id].$patch({
        json: formattedData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Falha ao atualizar entrada");
      }
      
      return response.json();
    },
    onSuccess: (updatedEntry) => {
      toast.success("Entrada atualizada com sucesso!");
      
      // Update the cache with the new data
      queryClient.setQueryData<Entry>(["entries", id], (oldData) => {
        if (!oldData) return updatedEntry;
        return {
          ...oldData,
          ...updatedEntry,
        };
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: (error) => {
      console.error("Falha ao atualizar entrada:", error);
      toast.error("Erro ao atualizar entrada");
    },
  });
}; 
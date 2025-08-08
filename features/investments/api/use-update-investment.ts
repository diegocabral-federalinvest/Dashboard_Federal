import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/hono";
import { Investment } from "./use-get-investment";

interface UpdateInvestmentData {
  value?: number | string;
  investorName?: string;
  investorId?: string;
  description?: string;
  date?: Date | string;
  startDate?: Date | string;
  returnRate?: number;
  status?: "active" | "completed" | "withdrawn";
}

export const useUpdateInvestment = (id?: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateInvestmentData) => {
      if (!id) throw new Error("ID é necessário");
      
      console.log("📝 [UPDATE] Dados originais:", data);
      
      // Format the data as needed
      const formattedData = {
        ...data,
        // Convert dates to ISO strings if needed
        date: data.date instanceof Date ? data.date.toISOString() : data.date,
        startDate: data.startDate instanceof Date ? data.startDate.toISOString() : data.startDate,
        // Ensure value is a number
        value: typeof data.value === 'string' ? parseFloat(data.value) : data.value
      };
      
      // Remove campos undefined ou null
      Object.keys(formattedData).forEach(key => {
        if (formattedData[key as keyof typeof formattedData] === undefined || 
            formattedData[key as keyof typeof formattedData] === null) {
          delete formattedData[key as keyof typeof formattedData];
        }
      });
      
      console.log("📤 [UPDATE] Dados formatados enviados:", formattedData);
      
      const response = await (client as any).api.investments[id].$patch({
        json: formattedData,
      });
      
      console.log("📥 [UPDATE] Response status:", response.status);
      
      if (!response.ok) {
        const error = await response.json();
        console.error("❌ [UPDATE] Erro da API:", error);
        throw new Error(error.message || error.error || "Falha ao atualizar investimento");
      }
      
      const result = await response.json();

      return result;
    },
    onSuccess: (updatedInvestment) => {
      toast.success("Investimento atualizado com sucesso!");
      
      // Update the cache with the new data
      queryClient.setQueryData<Investment>(["investments", id], (oldData) => {
        if (!oldData) return updatedInvestment;
        return {
          ...oldData,
          ...updatedInvestment,
        };
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["investments"] });
    },
    onError: (error) => {
      console.error("Falha ao atualizar investimento:", error);
      toast.error("Erro ao atualizar investimento");
    },
  });
}; 
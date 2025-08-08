import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/hono";

type CreateInvestmentData = {
  investorId: string;
  investorName: string;
  value: number;
  type?: "aporte" | "retirada";
  date: Date | string;
  startDate: Date | string;
  status: "active" | "completed" | "withdrawn";
  description: string;
  returnRate?: number;
};

export const useCreateInvestment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateInvestmentData) => {
      console.log("📝 [CREATE] Dados recebidos:", data);
      
      // Formatando os dados para enviar para a API
      const formattedData = {
        investorId: data.investorId,
        investorName: data.investorName,
        value: data.value,
        type: data.type || "aporte",
        date: data.date instanceof Date ? data.date.toISOString() : data.date,
        startDate: data.startDate instanceof Date ? data.startDate.toISOString() : data.startDate,
        status: data.status,
        description: data.description,
        returnRate: data.returnRate,
      };

      console.log("📤 [CREATE] Dados formatados enviados:", formattedData);

      const response = await (client as any).api.investments.$post({
        json: formattedData,
      });
      
      console.log("📥 [CREATE] Response status:", response.status);
      
      if (!response.ok) {
        const error = await response.json();
        console.error("❌ [CREATE] Erro da API:", error);
        throw new Error(error.message || error.error || "Falha ao criar investimento");
      }
      
      const result = await response.json();

      return result;
    },
    onSuccess: (data) => {
      console.log("[useCreateInvestment] Success:", data);
      toast.success(data.message || "Investimento criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["investments"] });
    },
    onError: (error: any) => {
      console.error("[useCreateInvestment] Error:", error);
      toast.error(error.message || "Erro ao criar investimento");
    },
  });
}; 
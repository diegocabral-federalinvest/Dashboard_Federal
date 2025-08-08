import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import logger from "@/lib/logger";

export interface SaveTaxDeductionParams {
  year: number;
  quarter: number;
  value: number;
}

interface SaveTaxDeductionOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useSaveTaxDeduction = (options?: SaveTaxDeductionOptions) => {
  const queryClient = useQueryClient();
  
  return useMutation<any, Error, SaveTaxDeductionParams>({
    mutationFn: async (data: SaveTaxDeductionParams) => {
      logger.info("Salvando dedução fiscal", {
        source: "frontend",
        context: "finance:use-save-tax-deduction",
        tags: ["mutation", "tax-deduction"],
        data: {
          year: data.year,
          quarter: data.quarter,
          value: data.value
        }
      });
      
      // Usando fetch diretamente com JSON.stringify para garantir formato correto
      const response = await fetch('/api/finance/tax_deduction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        let errorMessage = "Falha ao salvar dedução fiscal";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          logger.error("Falha ao salvar dedução fiscal", { 
            source: "frontend", 
            context: "finance:use-save-tax-deduction", 
            tags: ["error", "api-response"],
            data: errorData 
          });
        } catch (e) {
          // Se não conseguir fazer parse do JSON, usa o texto da resposta
          const errorText = await response.text();
          logger.error("Falha ao salvar dedução fiscal - resposta não-JSON", { 
            source: "frontend", 
            context: "finance:use-save-tax-deduction", 
            tags: ["error", "api-response"],
            data: { text: errorText, status: response.status } 
          });
        }
        throw new Error(errorMessage);
      }
      
      const responseData = await response.json();
      
      logger.info("Dedução fiscal salva com sucesso", {
        source: "frontend",
        context: "finance:use-save-tax-deduction",
        tags: ["success", "tax-deduction"],
        data: responseData
      });
      
      return responseData;
    },
    onSuccess: () => {
      // Invalidar consultas relacionadas para forçar recarregamento
      queryClient.invalidateQueries({ queryKey: ["dre"] });
      queryClient.invalidateQueries({ queryKey: ["tax-deduction"] });
      
      toast.success("Dedução fiscal salva com sucesso", {
        description: "Os valores de impostos foram recalculados."
      });
      
      if (options?.onSuccess) {
        options.onSuccess();
      }
    },
    onError: (error) => {
      logger.error("Erro ao salvar dedução fiscal", {
        source: "frontend",
        context: "finance:use-save-tax-deduction",
        tags: ["error", "tax-deduction"],
        data: {
          error: error.message,
          stack: error.stack
        }
      });
      
      toast.error("Erro ao salvar dedução fiscal", {
        description: error.message || "Ocorreu um erro ao salvar a dedução fiscal. Tente novamente."
      });
      
      if (options?.onError) {
        options.onError(error);
      }
    }
  });
};
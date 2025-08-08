import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import logger from "@/lib/logger";

interface TaxDeduction {
  id?: number;
  year: number;
  quarter: number;
  value: number;
  description?: string;
}

interface GetTaxDeductionParams {
  year: number;
  quarter: number;
}

// Hook para obter dedução fiscal
export const useGetTaxDeduction = (params: GetTaxDeductionParams) => {
  const { year, quarter } = params;
  
  return useQuery<TaxDeduction>({
    queryKey: ["taxDeduction", year, quarter],
    queryFn: async () => {
      logger.info("Buscando dedução fiscal", {
        source: "frontend",
        context: "finance:use-tax-deduction:get",
        tags: ["query", "tax-deduction"],
        data: { year, quarter }
      });
      
      const response = await (client as any).api[`/finance/tax_deduction?year=${year}&quarter=${quarter}`].$get();
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Falha ao carregar dedução fiscal");
      }
      
      const data = await response.json();
      
      logger.debug("Dedução fiscal recebida", {
        source: "frontend",
        context: "finance:use-tax-deduction:get",
        tags: ["response", "tax-deduction"],
        data: { value: data.data.value }
      });
      
      return data.data;
    },
    enabled: Boolean(year && quarter),
  });
};

// Hook para salvar dedução fiscal
export const useSaveTaxDeduction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: TaxDeduction) => {
      logger.info("Salvando dedução fiscal", {
        source: "frontend",
        context: "finance:use-tax-deduction:save",
        tags: ["mutation", "tax-deduction"],
        data: { year: data.year, quarter: data.quarter, value: data.value }
      });
      
      const response = await (client as any).api['/finance/tax_deduction'].$post({
        json: data
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Falha ao salvar dedução fiscal");
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      logger.debug("Dedução fiscal salva com sucesso", {
        source: "frontend",
        context: "finance:use-tax-deduction:save",
        tags: ["success", "tax-deduction"],
        data: { year: variables.year, quarter: variables.quarter }
      });
      
      // Invalidar consultas relacionadas
      queryClient.invalidateQueries({ 
        queryKey: ["taxDeduction", variables.year, variables.quarter]
      });
      
      // Também invalidar o DRE para atualizar os valores
      queryClient.invalidateQueries({
        queryKey: ["dre"]
      });
    },
  });
}; 
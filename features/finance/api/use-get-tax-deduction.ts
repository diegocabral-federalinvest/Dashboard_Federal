import { useQuery } from "@tanstack/react-query";
import logger from "@/lib/logger";

export interface TaxDeductionData {
  id?: number;
  year: number;
  quarter: number;
  value: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetTaxDeductionParams {
  year: number;
  quarter: number;
}

export const useGetTaxDeduction = (params: GetTaxDeductionParams) => {
  const { year, quarter } = params;
  
  return useQuery<TaxDeductionData>({
    queryKey: ["tax-deduction", year, quarter],
    queryFn: async () => {
      logger.info("Buscando dedução fiscal", {
        source: "frontend",
        context: "finance:use-get-tax-deduction",
        tags: ["query", "tax-deduction"],
        data: { year, quarter }
      });
      
      // Usando fetch diretamente em vez do client Hono
      const response = await fetch(`/api/finance/tax_deduction?year=${year}&quarter=${quarter}`);
      
      if (!response.ok) {
        let errorMessage = "Falha ao buscar dedução fiscal";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          logger.error("Falha ao buscar dedução fiscal", { 
            source: "frontend", 
            context: "finance:use-get-tax-deduction", 
            tags: ["error", "api-response"],
            data: errorData 
          });
        } catch (e) {
          // Se não conseguir fazer parse do JSON, usa o texto da resposta
          const errorText = await response.text();
          logger.error("Falha ao buscar dedução fiscal - resposta não-JSON", { 
            source: "frontend", 
            context: "finance:use-get-tax-deduction", 
            tags: ["error", "api-response"],
            data: { text: errorText, status: response.status } 
          });
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      logger.debug("Dedução fiscal recebida", {
        source: "frontend",
        context: "finance:use-get-tax-deduction",
        tags: ["response", "tax-deduction"],
        data: { 
          value: data.data?.value,
          year: data.data?.year,
          quarter: data.data?.quarter
        }
      });
      
      return data.data;
    },
    enabled: Boolean(year && quarter),
  });
};
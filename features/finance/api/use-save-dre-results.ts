import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";
import logger from "@/lib/logger";
import { DREData } from "./use-get-dre";

export interface SaveDREResultsParams {
  year: number;
  quarter?: number;
  month?: number;
  dreData: DREData;
}

interface SaveDREResultsOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useSaveDREResults = (options?: SaveDREResultsOptions) => {
  const queryClient = useQueryClient();
  
  return useMutation<any, Error, SaveDREResultsParams>({
    mutationFn: async (data: SaveDREResultsParams) => {
      logger.info("Salvando resultados DRE", {
        source: "frontend",
        context: "finance:use-save-dre-results",
        tags: ["mutation", "dre-results"],
        data: {
          year: data.year,
          quarter: data.quarter,
          month: data.month,
          dreData: {
            receitas: data.dreData.receitas,
            resultadoLiquido: data.dreData.resultadoLiquido,
            deducaoFiscal: data.dreData.deducaoFiscal
          }
        }
      });
      
      let endpoint = '/finance/quarterly-result';
      if (data.month) {
        endpoint = '/finance/monthly-result'; // For future implementation
      }
      
      // Prepare data for API call
      const apiData = data.quarter ? {
        year: data.year,
        quarter: data.quarter,
        taxDeduction: data.dreData.deducaoFiscal || 0,
        totalOperation: data.dreData.receitas.operacoes,
        totalOtherIncome: data.dreData.receitas.outras,
        totalIncome: data.dreData.receitas.total,
        totalFator: data.dreData.custos.fator,
        totalAdValorem: data.dreData.custos.adValorem,
        totalIOF: data.dreData.custos.iof,
        totalCosts: data.dreData.custos.total,
        totalPis: data.dreData.impostos.pis,
        totalCofins: data.dreData.impostos.cofins,
        totalIssqn: data.dreData.impostos.issqn,
        totalIRPJ: data.dreData.impostos.ir,
        totalCSLL: data.dreData.impostos.csll,
        totalTaxableExpenses: data.dreData.despesas.tributaveis,
        totalNonTaxableExpenses: data.dreData.despesas.total - data.dreData.despesas.tributaveis,
        totalExpenses: data.dreData.despesas.total,
        grossRevenue: data.dreData.receitas.total,
        netRevenue: data.dreData.resultadoBruto,
        grossResult: data.dreData.resultadoOperacional,
        netResult: data.dreData.resultadoLiquido
      } : null;
      
      if (!apiData) {
        throw new Error("Parâmetros inválidos para salvar resultados");
      }
      
      logger.debug("Enviando dados DRE para API", {
        source: "frontend",
        context: "finance:use-save-dre-results",
        tags: ["debug", "dre-results"],
        data: apiData
      });
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        logger.error("Falha ao salvar resultados DRE", { 
          source: "frontend", 
          context: "finance:use-save-dre-results", 
          tags: ["error", "api-response"],
          data: error 
        });
        throw new Error(error.message || "Falha ao salvar resultados DRE");
      }
      
      const responseData = await response.json();
      
      logger.info("Resultados DRE salvos com sucesso", {
        source: "frontend",
        context: "finance:use-save-dre-results",
        tags: ["success", "dre-results"],
        data: responseData
      });
      
      // Also update tax deduction when saving DRE results
      if (data.quarter && data.dreData.deducaoFiscal !== undefined) {
        logger.info("Atualizando dedução fiscal", {
          source: "frontend",
          context: "finance:use-save-dre-results",
          tags: ["info", "tax-deduction"],
          data: {
            year: data.year,
            quarter: data.quarter,
            value: data.dreData.deducaoFiscal
          }
        });
        
        try {
          const taxDeductionResponse = await fetch('/api/finance/tax_deduction', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              year: data.year,
              quarter: data.quarter,
              value: data.dreData.deducaoFiscal
            })
          });
          
          if (!taxDeductionResponse.ok) {
            const taxError = await taxDeductionResponse.json();
            logger.warn("Falha ao salvar dedução fiscal durante salvamento de DRE", { 
              source: "frontend", 
              context: "finance:use-save-dre-results", 
              tags: ["warning", "tax-deduction"],
              data: taxError 
            });
            // Don't throw an error here, we'll just log a warning
          } else {
            logger.info("Dedução fiscal salva com sucesso", {
              source: "frontend",
              context: "finance:use-save-dre-results",
              tags: ["success", "tax-deduction"]
            });
          }
        } catch (taxError) {
          logger.warn("Erro ao salvar dedução fiscal durante salvamento de DRE", { 
            source: "frontend", 
            context: "finance:use-save-dre-results", 
            tags: ["warning", "tax-deduction"],
            data: {
              error: taxError instanceof Error ? taxError.message : String(taxError)
            }
          });
          // Don't throw an error here, we'll just log a warning
        }
      }
      
      return responseData;
    },
    onSuccess: () => {
      // Invalidate queries to force reload
      queryClient.invalidateQueries({ queryKey: ["dre"] });
      queryClient.invalidateQueries({ queryKey: ["tax-deduction"] });
      
      toast.success("Resultados do DRE salvos com sucesso", {
        description: "Os dados financeiros foram atualizados."
      });
      
      if (options?.onSuccess) {
        options.onSuccess();
      }
    },
    onError: (error) => {
      logger.error("Erro ao salvar resultados DRE", {
        source: "frontend",
        context: "finance:use-save-dre-results",
        tags: ["error", "dre-results"],
        data: {
          error: error.message,
          stack: error.stack
        }
      });
      
      toast.error("Erro ao salvar resultados DRE", {
        description: error.message || "Ocorreu um erro ao salvar os dados financeiros. Tente novamente."
      });
      
      if (options?.onError) {
        options.onError(error);
      }
    }
  });
}; 
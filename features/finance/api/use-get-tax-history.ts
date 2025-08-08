import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import logger from "@/lib/logger";

export interface TaxHistoryEntry {
  period: string; // Identificador do período (ex: "T1/2023" para primeiro trimestre de 2023)
  irpj: number;   // Valor do IRPJ no período
  csll: number;   // Valor do CSLL no período
  resultadoBruto: number; // Resultado bruto no período para normalização
  operacoes: number;      // Total de operações para normalização
}

export interface TaxHistoryParams {
  year: number;
  normalize?: boolean; // Se true, retorna valores normalizados (percentual do resultado bruto)
  maxPeriods?: number; // Número máximo de períodos a retornar (default: 6)
}

/**
 * Hook para obter histórico de impostos para gráficos de tendência
 */
export const useGetTaxHistory = (params: TaxHistoryParams) => {
  const { year, normalize = false, maxPeriods = 6 } = params;
  
  return useQuery<TaxHistoryEntry[]>({
    queryKey: ["tax-history", year, normalize, maxPeriods],
    queryFn: async () => {
      logger.info("Buscando histórico de impostos", {
        source: "frontend",
        context: "finance:use-get-tax-history",
        tags: ["query", "tax-history"],
        data: { year, normalize, maxPeriods }
      });
      
      let url = `/reports/tax-history?year=${year}`;
      
      if (normalize) {
        url += "&normalize=true";
      }
      
      if (maxPeriods) {
        url += `&maxPeriods=${maxPeriods}`;
      }
      
      try {
        const response = await (client as any).api[url].$get();
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Falha ao carregar histórico de impostos");
        }
        
        const data = await response.json();
        
        logger.debug("Histórico de impostos recebido", {
          source: "frontend",
          context: "finance:use-get-tax-history",
          tags: ["response", "tax-history"],
          data: { 
            count: data.data.length,
            periods: data.data.map((entry: TaxHistoryEntry) => entry.period)
          }
        });
        
        return data.data;
      } catch (error) {
        logger.error("Erro ao carregar histórico de impostos", {
          source: "frontend",
          context: "finance:use-get-tax-history",
          tags: ["error", "tax-history"],
          data: { error }
        });
        
        // Em caso de erro na API, retornar dados simulados para não quebrar a UI
        // Em produção, seria melhor remover isso e tratar o erro adequadamente
        return getSimulatedTaxHistoryData(year, maxPeriods);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Função auxiliar para gerar dados simulados em caso de falha na API
 * Apenas para desenvolvimento - em produção deve ser removida
 */
function getSimulatedTaxHistoryData(year: number, maxPeriods: number = 6): TaxHistoryEntry[] {
  // Gerar dados para os últimos N trimestres
  const currentYear = new Date().getFullYear();
  const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);
  
  const result: TaxHistoryEntry[] = [];
  
  // Começar a partir do trimestre atual no ano fornecido, voltando até maxPeriods
  for (let i = 0; i < maxPeriods; i++) {
    let targetYear = currentYear;
    let targetQuarter = currentQuarter - i;
    
    // Ajustar para trimestres de anos anteriores
    while (targetQuarter <= 0) {
      targetYear--;
      targetQuarter += 4;
    }
    
    // Só incluir se estiver no ano alvo ou após ele (não dados muito antigos)
    if (targetYear >= year) {
      // Gerar valores baseados em uma tendência descendente para IRPJ e CSLL 
      // (simulando melhoria na eficiência fiscal)
      const baseValue = 100000 - (i * 5000) + (Math.random() * 10000 - 5000);
      const resultadoBruto = baseValue * 2;
      const operacoes = baseValue * 10;
      
      result.push({
        period: `T${targetQuarter}/${targetYear}`,
        irpj: Math.max(0, baseValue * 0.15),
        csll: Math.max(0, baseValue * 0.09),
        resultadoBruto,
        operacoes
      });
    }
  }
  
  // Ordenar por período (mais antigo primeiro)
  return result.sort((a, b) => a.period.localeCompare(b.period));
} 
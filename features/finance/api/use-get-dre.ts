import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import logger from "@/lib/logger";

// Interface para os dados do DRE retornados pela API
export interface DREData {
  periodo: {
    mes: number;
    ano: number;
    dataInicio: string;
    dataFim: string;
    trimestral: boolean;
    anual: boolean;
  };
  receitas: {
    operacoes: number;
    outras: number;
    total: number;
  };
  custos: {
    fator: number;
    adValorem: number;
    iof: number;
    tarifas: number;
    total: number;
  };
  deducaoFiscal: number;
  resultadoBruto: number;
  despesas: {
    operacionais: number;
    tributaveis: number;
    total: number;
  };
  resultadoOperacional: number;
  impostos: {
    pis: number;
    cofins: number;
    issqn: number;
    ir: number;
    csll: number;
    total: number;
  };
  resultadoLiquido: number;
}

export interface DREParams {
  year: number | null; // Permitir null para "todos os anos"
  month?: number;
  quarter?: number;
  isAnnual?: boolean;
}

export const useGetDRE = (params: DREParams) => {
  const { year, month, quarter, isAnnual } = params;
  
  // Função para calcular mês com base no trimestre (1-4)
  const getMonthFromQuarter = (quarter: number) => {
    // Retorna o primeiro mês do trimestre (1=Jan, 2=Abr, 3=Jul, 4=Out)
    return (quarter - 1) * 3 + 1;
  };
  
  return useQuery<DREData>({
    queryKey: ["dre", year, month, quarter, isAnnual],
    queryFn: async () => {
      logger.info("Buscando dados do DRE", {
        source: "frontend",
        context: "finance:use-get-dre",
        tags: ["query", "dre"],
        data: { year, month, quarter, isAnnual }
      });
      
      let queryParams = new URLSearchParams();
      
      // Tratar year null (todos os anos)
      if (year !== null) {
        queryParams.append("year", year.toString());
      } else {
        queryParams.append("year", "null"); // String "null" para identificar todos os anos
      }
      
      if (isAnnual) {
        queryParams.append("annual", "true");
      } else if (quarter) {
        const monthValue = getMonthFromQuarter(quarter);
        queryParams.append("month", monthValue.toString());
        queryParams.append("quarterly", "true");
      } else if (month) {
        queryParams.append("month", month.toString());
      }
      
      // Construir a URL relativa para a API
      const apiPath = `/api/reports/dre?${queryParams.toString()}`;
      
      logger.debug("Chamando API DRE", {
        source: "frontend",
        context: "finance:use-get-dre",
        tags: ["debug", "api-call"],
        data: { 
          apiPath,
          params: Object.fromEntries(queryParams.entries()),
          isBrowser: typeof window !== 'undefined',
          origin: typeof window !== 'undefined' ? window.location.origin : 'server'
        }
      });
      
      // Log detalhado para depuração
  
      
      
      try {
        // Usar fetch com URL relativa para evitar problemas de CORS
        const response = await fetch(apiPath);
        
        logger.debug("Resposta recebida da API DRE", {
          source: "frontend",
          context: "finance:use-get-dre",
          tags: ["debug", "api-response"],
          data: { status: response.status, ok: response.ok }
        });
        
        console.log(`🔍 Resposta recebida: Status ${response.status}, OK: ${response.ok}`);
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        logger.debug("Dados do DRE recebidos", {
          source: "frontend",
          context: "finance:use-get-dre",
          tags: ["response", "dre"],
          data: { 
            receitas: data.data?.receitas?.total,
            despesas: data.data?.despesas?.total,
            resultadoLiquido: data.data?.resultadoLiquido
          }
        });
        
        return data.data;
      } catch (error) {
        const errorMessage = (error as Error).message;
        logger.error("Erro ao buscar dados do DRE", {
          source: "frontend",
          context: "finance:use-get-dre",
          tags: ["error", "api-call"],
          data: { error: errorMessage }
        });
        
        // Log adicional para depuração
        console.error("❌ Erro ao buscar dados do DRE:", errorMessage);
        
        throw error;
      }
    },
    enabled: Boolean(year),
    retry: 1, // Limite a uma nova tentativa para evitar muitas chamadas com erro
  });
}; 
import { useEffect, useState, useCallback } from "react";
import { useGetDRE, DREData, DREParams } from "@/features/finance/api/use-get-dre";
import { getCachedDREData, cacheDREData, invalidateDRECache } from "@/lib/storage/cache-utils";
import { Period } from "@/features/finance/types";
import { saveDREPeriod, getDREPeriod } from "@/lib/storage/user-preferences";

// Função para gerar uma chave de cache baseada no período
const generateCacheKey = (period: Period): string => {
  return `${period.periodType}_${period.year}_${period.quarter || period.month || 0}`;
};

interface UseDREDataOptions {
  onDataLoaded?: (data: DREData) => void;
  enableCache?: boolean;
}

interface UseDREDataResult {
  data: DREData | null;
  isLoading: boolean;
  isLoadingFromCache: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => Promise<DREData | null>;
  setPeriod: (period: Period) => void;
  period: Period;
  updateDeduction: (value: number) => void;
}

/**
 * Hook personalizado para gerenciar dados do DRE com suporte a cache e estado persistente
 */
export const useDREData = (options?: UseDREDataOptions): UseDREDataResult => {
  // Carregar período inicial do armazenamento
  const defaultPeriod: Period = {
    month: new Date().getMonth() + 1,
    quarter: Math.ceil((new Date().getMonth() + 1) / 3),
    year: new Date().getFullYear(),
    deducaoFiscal: 0,
    periodType: "quarterly"
  };
  
  // Estado para período atual
  const [period, setPeriod] = useState<Period>(() => {
    const savedPeriod = getDREPeriod();
    return savedPeriod || defaultPeriod;
  });
  
  // Estado para dados em cache
  const [cachedData, setCachedData] = useState<DREData | null>(null);
  
  // Estado para indicar se está carregando do cache
  const [isLoadingFromCache, setIsLoadingFromCache] = useState(false);
  
  // Parâmetros para a consulta
  const queryParams: DREParams = {
    year: period.year,
    month: period.periodType === "monthly" ? period.month : undefined,
    quarter: period.periodType === "quarterly" ? period.quarter : undefined,
    isAnnual: period.periodType === "annual",
  };
  
  // Consulta para obter dados
  const { 
    data: apiData, 
    isLoading, 
    error, 
    refetch,
    isFetching
  } = useGetDRE(queryParams);
  
  // Efeito para tentar carregar dados do cache quando o período muda
  useEffect(() => {
    const tryLoadFromCache = async () => {
      if (options?.enableCache !== false) {
        const cacheKey = generateCacheKey(period);
        const cached = getCachedDREData(cacheKey);
        
        if (cached) {
          setIsLoadingFromCache(true);
          setCachedData(cached);
        } else {
          setIsLoadingFromCache(false);
          setCachedData(null);
        }
      }
    };
    
    tryLoadFromCache();
    
    // Persistir o período
    saveDREPeriod(period);
  }, [period, options?.enableCache]);
  
  // Efeito para atualizar o cache quando os dados da API são carregados
  useEffect(() => {
    if (apiData && !isLoading && options?.enableCache !== false) {
      const cacheKey = generateCacheKey(period);
      cacheDREData(cacheKey, apiData);
      
      // Resetar estado de carregamento do cache
      setIsLoadingFromCache(false);
      
      // Notificar dados carregados, se callback fornecido
      if (options?.onDataLoaded) {
        options.onDataLoaded(apiData);
      }
    }
  }, [apiData, isLoading, period, options]);
  
  // Função para alterar período
  const handleSetPeriod = useCallback((newPeriod: Period) => {
    setPeriod(newPeriod);
    saveDREPeriod(newPeriod);
  }, []);
  
  // Função para atualizar dedução fiscal
  const updateDeduction = useCallback((value: number) => {
    setPeriod(prevPeriod => {
      const updatedPeriod = {
        ...prevPeriod,
        deducaoFiscal: value
      };
      
      // Também atualiza o armazenamento persistente
      saveDREPeriod(updatedPeriod);
      
      return updatedPeriod;
    });
    
    // Invalidar cache para forçar recarregamento
    const cacheKey = generateCacheKey(period);
    invalidateDRECache(cacheKey);
  }, [period]);
  
  // Determine os dados efetivos (API ou cache)
  const effectiveData = apiData || (isLoadingFromCache ? cachedData : null);
  
  return {
    data: effectiveData,
    isLoading: isLoading && !isLoadingFromCache,
    isLoadingFromCache,
    isFetching,
    error: error as Error | null,
    refetch: async () => {
      // Invalidar cache antes de refetch
      invalidateDRECache(generateCacheKey(period));
      
      try {
        const result = await refetch();
        return result.data || null;
      } catch (err) {
        console.error("Erro ao recarregar dados DRE:", err);
        return null;
      }
    },
    setPeriod: handleSetPeriod,
    period,
    updateDeduction
  };
}; 
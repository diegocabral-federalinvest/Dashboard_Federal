/**
 * 🏦 Unified Financial Data Hook
 * 
 * Hook unificado que centraliza todos os dados financeiros da aplicação.
 * Substitui useDashboardData e useGetDRE com uma interface única e consistente.
 */

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import {
  financialDataService,
  FinancialDataParams,
  UnifiedFinancialData,
  Period,
  PeriodUtils,
  InvestmentData,
  OperationalData
} from "@/lib/services/financial-data-service";
import { 
  saveDashboardPeriod, 
  saveDashboardPeriodType, 
  getDashboardPeriod, 
  getDashboardPeriodType,
  saveDREPeriod,
  saveDREPeriodType,
  getDREPeriod,
  getDREPeriodType
} from "@/lib/storage/user-preferences";
import logger from "@/lib/logger";

// ===== INTERFACES =====

export interface UseFinancialDataOptions {
  // Configurações de dados
  includeInvestments?: boolean;
  includeOperational?: boolean;
  includePreviousPeriod?: boolean;
  
  // Configurações de cache e atualização
  enableCache?: boolean;
  refetchInterval?: number;
  
  // Configurações de persistência
  persistPreferences?: boolean;
  preferenceKey?: 'dashboard' | 'dre' | 'custom';
  
  // Callbacks
  onDataLoaded?: (data: UnifiedFinancialData) => void;
  onError?: (error: Error) => void;
  
  // Período inicial
  initialPeriod?: Partial<Period>;
}

export interface UseFinancialDataResult {
  // Dados principais
  data: UnifiedFinancialData | null;
  chartData: any[];
  
  // Estados de loading
  isLoading: boolean;
  isLoadingFromCache: boolean;
  isFetching: boolean;
  error: Error | null;
  
  // Período atual
  period: Period;
  periodLabel: string;
  
  // Controles de período
  setPeriod: (period: Period) => void;
  setYear: (year: number | null) => void;
  setMonth: (month: number) => void;
  setQuarter: (quarter: number) => void;
  setPeriodType: (type: "monthly" | "quarterly" | "annual") => void;
  
  // Ações
  refetch: () => Promise<void>;
  clearCache: () => void;
  updateTaxDeduction: (deduction: number) => Promise<void>;
  updateManualQuarterlyTaxes: (csll: number, irpj: number) => Promise<void>;
  
  // Shortcuts para diferentes visualizações
  setQuarterlyView: (year: number, quarter: number) => void;
  setMonthlyView: (year: number, month: number) => void;
  setYearlyView: (year: number) => void;
  
  // Dados específicos (para compatibilidade)
  stats: UnifiedFinancialData['stats'] | null;
  investments: InvestmentData | null;
  operational: OperationalData | null;
  
  // Estados auxiliares
  hasInvestmentData: boolean;
  hasOperationalData: boolean;
  hasPreviousPeriodData: boolean;
}

// ===== HOOK PRINCIPAL =====

export function useFinancialData(options: UseFinancialDataOptions = {}): UseFinancialDataResult {
  const {
    includeInvestments = true,
    includeOperational = true,
    includePreviousPeriod = true,
    enableCache = true,
    refetchInterval,
    persistPreferences = true,
    preferenceKey = 'dashboard',
    onDataLoaded,
    onError,
    initialPeriod
  } = options;

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ===== ESTADO DO PERÍODO =====
  
  const [period, setPeriodState] = useState<Period>(() => {
    // Carregar período inicial das preferências ou usar padrão
    const getInitialPeriod = (): Period => {
      // Tentar carregar das preferências baseado na chave
      let savedPeriod: any = null;
      
      if (preferenceKey === 'dashboard') {
        savedPeriod = getDashboardPeriod();
      } else if (preferenceKey === 'dre') {
        savedPeriod = getDREPeriod();
      }
      
      // CORREÇÃO: Garantir período válido com valores padrão consistentes
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentQuarter = Math.ceil((currentDate.getMonth() + 1) / 3);
      const currentMonth = currentDate.getMonth() + 1;
      
      const basePeriod = savedPeriod || {
        year: currentYear,
        month: currentMonth,
        quarter: currentQuarter,
        periodType: "quarterly" as const, // Padrão trimestral
        deducaoFiscal: 0
      };
      
      // Garantir que o período resultante seja sempre válido
      const finalPeriod = { ...basePeriod, ...initialPeriod };
      
      // Validação: se é mensal, garantir que tem mês; se é trimestral, garantir que tem quarter
      if (finalPeriod.periodType === "monthly" && !finalPeriod.month) {
        finalPeriod.month = currentMonth;
      }
      if (finalPeriod.periodType === "quarterly" && !finalPeriod.quarter) {
        finalPeriod.quarter = currentQuarter;
      }
      
      return finalPeriod;
    };

    return getInitialPeriod();
  });

  // ===== QUERY PARA DADOS =====
  
  const queryParams: FinancialDataParams = useMemo(() => {
    // CORREÇÃO: Para trimestral, sempre passar o primeiro mês do trimestre
    let monthParam: number | undefined = undefined;
    if (period.periodType === "monthly") {
      monthParam = period.month;
    } else if (period.periodType === "quarterly" && period.quarter) {
      // Calcular o primeiro mês do trimestre especificado
      monthParam = (period.quarter - 1) * 3 + 1; // Q1=1, Q2=4, Q3=7, Q4=10
    }
    
    // Validação: Se é mensal ou trimestral mas não tem mês, ou se é trimestral mas não tem quarter
    const isValidPeriod = 
      period.periodType === "annual" || 
      (period.periodType === "monthly" && period.month) ||
      (period.periodType === "quarterly" && period.quarter);
    
    if (!isValidPeriod) {
      logger.warn("Invalid period configuration", {
        source: "frontend",
        context: "use-financial-data",
        tags: ["validation", "period"],
        data: { period }
      });
    }
    
    return {
      year: period.year,
      month: monthParam,
      quarter: period.periodType === "quarterly" ? period.quarter : undefined,
      isAnnual: period.periodType === "annual",
      includeInvestments,
      includeOperational,
      includePreviousPeriod,
    };
  }, [period, includeInvestments, includeOperational, includePreviousPeriod]);

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch: refetchQuery
  } = useQuery({
    queryKey: ['financial-data', queryParams, preferenceKey],
    queryFn: () => financialDataService.getFinancialData(queryParams),
    enabled: true, // Sempre habilitado, mesmo quando year é null
    staleTime: enableCache ? 2 * 60 * 1000 : 0, // 2 minutos (reduzido para atualizações mais frequentes)
    gcTime: enableCache ? 10 * 60 * 1000 : 0, // 10 minutos (reduzido para evitar cache excessivo)
    refetchInterval,
    retry: 1, // Reduzido de 2 para 1 para falhar mais rapidamente
    retryDelay: 1000, // Delay fixo de 1s ao invés de exponential
    refetchOnWindowFocus: false, // Evitar refetch desnecessário
    refetchOnMount: 'always', // Sempre buscar dados frescos ao montar
  });

  // ===== EFEITOS =====
  
  // Efeito para persistir preferências quando o período muda
  useEffect(() => {
    if (persistPreferences) {
      if (preferenceKey === 'dashboard') {
        saveDashboardPeriod(period);
        saveDashboardPeriodType(period.periodType);
      } else if (preferenceKey === 'dre') {
        saveDREPeriod(period);
        saveDREPeriodType(period.periodType);
      }
    }
  }, [period, persistPreferences, preferenceKey]);

  // Efeito para callback de dados carregados
  useEffect(() => {
    if (data && onDataLoaded) {
      onDataLoaded(data);
    }
  }, [data, onDataLoaded]);

  // Efeito para callback de erro
  useEffect(() => {
    if (error && onError) {
      onError(error as Error);
    }
  }, [error, onError]);

  // Efeito para logs
  useEffect(() => {
    if (data) {
      logger.info("Dados financeiros carregados via hook unificado", {
        source: "frontend",
        context: "use-financial-data",
        tags: ["data-loaded"],
        data: {
          period,
          resultadoLiquido: data.resultadoLiquido,
          receitas: data.receitas.total,
          hasInvestments: !!data.investments,
          hasOperational: !!data.operational
        }
      });
    }
  }, [data, period]);

  // ===== HANDLERS =====
  
  const setPeriod = useCallback((newPeriod: Period) => {
    const validatedPeriod = PeriodUtils.validatePeriod(newPeriod);
    setPeriodState(validatedPeriod);
    
    logger.debug("Período atualizado", {
      source: "frontend",
      context: "use-financial-data",
      tags: ["period-change"],
      data: { oldPeriod: period, newPeriod: validatedPeriod }
    });
  }, [period]);

  const setYear = useCallback((year: number | null) => {
    setPeriod({ ...period, year });
  }, [period, setPeriod]);

  const setMonth = useCallback((month: number) => {
    setPeriod({ ...period, month, periodType: "monthly" });
  }, [period, setPeriod]);

  const setQuarter = useCallback((quarter: number) => {
    setPeriod({ ...period, quarter, periodType: "quarterly" });
  }, [period, setPeriod]);

  const setPeriodType = useCallback((periodType: "monthly" | "quarterly" | "annual") => {
    setPeriod({ ...period, periodType });
  }, [period, setPeriod]);

  const refetch = useCallback(async () => {
    try {
      await refetchQuery();
      toast({
        title: "Dados atualizados",
        description: "Os dados financeiros foram recarregados com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível recarregar os dados. Tente novamente.",
        variant: "destructive",
      });
    }
  }, [refetchQuery, toast]);

  const clearCache = useCallback(() => {
    // Limpar cache do serviço
    financialDataService.clearCache();
    
    // Invalidar queries do React Query
    queryClient.invalidateQueries({ queryKey: ['financial-data'] });
    
    toast({
      title: "Cache limpo",
      description: "O cache de dados financeiros foi limpo.",
    });
  }, [queryClient, toast]);

  const updateTaxDeduction = useCallback(async (deduction: number) => {
    try {
      await financialDataService.updateTaxDeduction(period, deduction);
      
      // Atualizar período local com nova dedução
      setPeriod({ ...period, deducaoFiscal: deduction });

      // Invalidar a query de dados financeiros para forçar o refetch
      await queryClient.invalidateQueries({ queryKey: ['financial-data'] });
      
      // Recarregar dados (opcional, pois a invalidação já deve acionar)
      await refetch();
      
      toast({
        title: "Dedução fiscal mensal atualizada",
        description: "Os impostos foram recalculados com a nova dedução.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar dedução",
        description: "Não foi possível salvar a dedução fiscal.",
        variant: "destructive",
      });
      throw error;
    }
  }, [period, setPeriod, refetch, toast, queryClient]);
  
  const updateManualQuarterlyTaxes = useCallback(async (csll: number, irpj: number) => {
    try {
      await financialDataService.updateManualQuarterlyTaxes(period, csll, irpj);
      
      // Invalidar a query de dados financeiros para forçar o refetch
      await queryClient.invalidateQueries({ queryKey: ['financial-data'] });
      
      // Recarregar dados
      await refetch();
      
      toast({
        title: "Impostos trimestrais atualizados",
        description: "CSLL e IRPJ manuais foram salvos com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar impostos",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
      throw error;
    }
  }, [period, queryClient, refetch, toast]);

  // ===== SHORTCUTS =====
  
  const setQuarterlyView = useCallback((year: number, quarter: number) => {
    setPeriod({
      year,
      quarter,
      periodType: "quarterly",
      deducaoFiscal: period.deducaoFiscal
    });
  }, [setPeriod, period.deducaoFiscal]);

  const setMonthlyView = useCallback((year: number, month: number) => {
    setPeriod({
      year,
      month,
      periodType: "monthly",
      deducaoFiscal: period.deducaoFiscal
    });
  }, [setPeriod, period.deducaoFiscal]);

  const setYearlyView = useCallback((year: number) => {
    setPeriod({
      year,
      periodType: "annual",
      deducaoFiscal: period.deducaoFiscal
    });
  }, [setPeriod, period.deducaoFiscal]);

  // ===== COMPUTED VALUES =====
  
  const periodLabel = useMemo(() => PeriodUtils.getPeriodLabel(period), [period]);
  
  const chartData = useMemo(() => data?.chartData || [], [data]);
  
  const stats = useMemo(() => data?.stats || null, [data]);
  
  const investments = useMemo(() => data?.investments || null, [data]);
  
  const operational = useMemo(() => data?.operational || null, [data]);
  
  const hasInvestmentData = useMemo(() => !!data?.investments, [data]);
  
  const hasOperationalData = useMemo(() => !!data?.operational, [data]);
  
  const hasPreviousPeriodData = useMemo(() => {
    return !!(data?.stats?.netProfitPrevious !== undefined && data?.stats?.netProfitPrevious !== 0);
  }, [data]);

  // ===== RETURN =====
  
  return {
    // Dados principais
    data: data || null,
    chartData,
    
    // Estados de loading
    isLoading,
    isLoadingFromCache: false,
    isFetching,
    error: error as Error | null,
    
    // Período atual
    period,
    periodLabel,
    
    // Controles de período
    setPeriod,
    setYear,
    setMonth,
    setQuarter,
    setPeriodType,
    
    // Ações
    refetch,
    clearCache,
    updateTaxDeduction,
    updateManualQuarterlyTaxes,
    
    // Shortcuts
    setQuarterlyView,
    setMonthlyView,
    setYearlyView,
    
    // Dados específicos
    stats,
    investments,
    operational,
    
    // Estados auxiliares
    hasInvestmentData,
    hasOperationalData,
    hasPreviousPeriodData,
  };
}

// ===== HOOKS ESPECIALIZADOS =====

/**
 * Hook especializado para o Dashboard
 */
export function useDashboardFinancialData(options: Omit<UseFinancialDataOptions, 'preferenceKey'> = {}) {
  return useFinancialData({
    ...options,
    preferenceKey: 'dashboard',
    includeInvestments: true,
    includeOperational: true,
    includePreviousPeriod: true,
  });
}

/**
 * Hook especializado para o DRE
 */
export function useDREFinancialData(options: Omit<UseFinancialDataOptions, 'preferenceKey'> = {}) {
  return useFinancialData({
    ...options,
    preferenceKey: 'dre',
    includeInvestments: false,
    includeOperational: false,
    includePreviousPeriod: true,
  });
}

/**
 * Hook para dados básicos apenas (sem investimentos nem operacional)
 */
export function useBasicFinancialData(options: Omit<UseFinancialDataOptions, 'includeInvestments' | 'includeOperational'> = {}) {
  return useFinancialData({
    ...options,
    includeInvestments: false,
    includeOperational: false,
  });
}

// ===== COMPATIBILITY EXPORTS =====

/**
 * @deprecated Use useDashboardFinancialData instead
 */
export const useDashboardData = useDashboardFinancialData;

/**
 * @deprecated Use useDREFinancialData instead
 */
export const useGetDRE = useDREFinancialData; 
"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardData } from "@/types/dashboard";
import { fetchDashboardData, DashboardFilterParams } from "@/lib/api-client";
import { 
  getDashboardPeriod, 
  getDashboardPeriodType,
  saveDashboardPeriod,
  saveDashboardPeriodType
} from "@/lib/storage/user-preferences";

enum IsPosititiveOrNegative {
  POSITIVE = "positive",
  NEGATIVE = "negative",
}


export interface UseDashboardDataOptions {
  initialFilters?: Partial<DashboardFilterParams>;
  enabled?: boolean;
  refetchInterval?: number;
}

export function useDashboardData(options?: UseDashboardDataOptions) {
  // Estados para filtros
  const [filters, setFilters] = useState<DashboardFilterParams>(() => {
    // Recuperar filtros salvos ou usar padrões
    const savedPeriod = getDashboardPeriod();
    const savedPeriodType = getDashboardPeriodType();
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const currentQuarter = Math.ceil(currentMonth / 3);

    return {
      period: "quarter" as const,
      year: currentYear,
      month: savedPeriod?.month || currentMonth,
      quarter: savedPeriod?.quarter || currentQuarter,
      includeRevenues: true,
      includeExpenses: true,
      includeInvestments: true,
      ...options?.initialFilters,
    };
  });

  // Query principal para buscar dados do dashboard
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboardData', filters],
    queryFn: () => fetchDashboardData(filters),
    enabled: options?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos (nova sintaxe para React Query v5)
    refetchInterval: options?.refetchInterval,
    retry: 2,
  });

  // Função para atualizar filtros e salvar preferências
  const updateFilters = (newFilters: Partial<DashboardFilterParams>) => {
    const updatedFilters = { ...filters, ...newFilters };
    
    setFilters(updatedFilters);
    
    // Salvar preferências do usuário
    if (updatedFilters.period) {
      saveDashboardPeriodType(updatedFilters.period as "monthly" | "quarterly" | "annual");
    }
    
    const periodData: any = {};
    if (updatedFilters.year) periodData.year = updatedFilters.year;
    if (updatedFilters.month) periodData.month = updatedFilters.month;
    if (updatedFilters.quarter) periodData.quarter = updatedFilters.quarter;
    
    if (Object.keys(periodData).length > 0) {
      saveDashboardPeriod(periodData);
    }
  };

  // Informações do período atual
  const currentPeriod = useMemo(() => {
    const period = filters.period;
    let periodType: "monthly" | "quarterly" | "annual";
    
    switch (period) {
      case "month":
        periodType = "monthly";
        break;
      case "quarter":
        periodType = "quarterly";
        break;
      case "year":
        periodType = "annual";
        break;
      default:
        periodType = "quarterly";
        break;
    }

    return {
      year: filters.year || new Date().getFullYear(),
      month: filters.month,
      quarter: filters.quarter,
      periodType,
    };
  }, [filters]);

  // Função para obter label do período
  const getPeriodLabel = useMemo(() => {
    const year = filters.year || new Date().getFullYear();
    
    switch (filters.period) {
      case "month":
        const monthNames = [
          "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
          "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];
        return `${monthNames[(filters.month || 1) - 1]} de ${year}`;
      
      case "quarter":
        return `${filters.quarter}º Trimestre de ${year}`;
      
      case "year":
        return `Ano de ${year}`;
      
      default:
        return "Período Personalizado";
    }
  }, [filters]);

  // Dados processados com fallback para dados de exemplo
  const processedData = useMemo((): DashboardData => {
    if (data) {
      return data;
    }

    // Dados de exemplo enquanto carrega ou se houver erro
    const generateExampleData = (): DashboardData => {
      const baseRevenues = Math.random() * 400000 + 200000;
      const baseExpenses = Math.random() * 300000 + 150000;
      const netProfit = baseRevenues - baseExpenses;
      const grossProfit = netProfit * 1.2;
      const previousNetProfit = netProfit * (0.8 + Math.random() * 0.4);
      const previousExpenses = baseExpenses * (0.8 + Math.random() * 0.4);

      return {
        summary: {
          grossRevenue: baseRevenues * 1.1,
          netRevenue: baseRevenues,
          taxableExpenses: baseExpenses * 0.7,
          nonTaxableExpenses: baseExpenses * 0.3,
          grossProfit,
          netProfit,
        },
        stats: {
          netProfit,
          netProfitPrevious: previousNetProfit,
          netProfitGrowth: ((netProfit - previousNetProfit) / previousNetProfit) * 100,
          projectedTaxes: grossProfit * 0.24,
          netProfitChange: netProfit >= previousNetProfit ? IsPosititiveOrNegative.POSITIVE : IsPosititiveOrNegative.NEGATIVE,
          netProfitChangeType: netProfit >= previousNetProfit ? IsPosititiveOrNegative.POSITIVE : IsPosititiveOrNegative.NEGATIVE,
          lastQuarter: previousNetProfit,
          growthRate: ((netProfit - previousNetProfit) / previousNetProfit) * 100,
          taxProjection: grossProfit * 0.24,
          
          totalExpenses: baseExpenses,
          expensesPrevious: previousExpenses,
          expensesGrowth: ((baseExpenses - previousExpenses) / previousExpenses) * 100,
          totalRevenues: baseRevenues,
          balance: baseRevenues - baseExpenses,
          
          totalInvestments: Math.random() * 1000000 + 500000,
          activeInvestors: Math.floor(Math.random() * 20) + 5,
          totalReturns: Math.random() * 200000 + 50000,
          totalContributions: Math.random() * 50 + 10,
          
          operationsTotal: baseRevenues * 0.8,
          operationsPrevious: previousNetProfit * 0.8,
          operationsCount: Math.floor(Math.random() * 100) + 20,
          totalOperations: Math.floor(Math.random() * 100) + 20,
          lastMonthOps: Math.floor(Math.random() * 50) + 10,
          totalOperationsCount: Math.floor(Math.random() * 100) + 20,
          
          // Dados legados
          grossRevenue: baseRevenues * 1.1,
          grossRevenueChange: IsPosititiveOrNegative.POSITIVE,
          grossRevenueChangeType: IsPosititiveOrNegative.POSITIVE,
          netRevenue: baseRevenues,
          netRevenueChange: IsPosititiveOrNegative.POSITIVE,
          netRevenueChangeType: IsPosititiveOrNegative.POSITIVE,
          grossProfit,
          grossProfitChange: IsPosititiveOrNegative.POSITIVE,
          grossProfitChangeType: IsPosititiveOrNegative.POSITIVE,
        },
        chartData: generateChartData(),
        charts: {
          revenue: [],
          expenses: [],
          profit: [],
          evolution: [],
          distribution: [],
          comparison: [],
          projections: [],
        },
        indicators: {
          grossMargin: (grossProfit / baseRevenues) * 100,
          netMargin: (netProfit / baseRevenues) * 100,
          yoyGrowth: 15.2,
          efficiencyRatio: 0.75,
        },
        operations: {
          recent: [
            { description: "Receita de Serviços", amount: 15000 },
            { description: "Despesa Operacional", amount: -8000 },
          ],
          pending: [
            { description: "Pagamento Pendente", amount: 5000 },
          ],
        },
        tables: {
          recentTransactions: [
            {
              id: "1",
              description: "Receita de Consultoria",
              amount: 15000,
              date: new Date().toISOString(),
              type: "income" as const,
              category: "Serviços",
            },
          ],
          activeInvestors: [
            {
              id: "1",
              name: "João Silva",
              totalInvested: 100000,
              currentValue: 120000,
              returns: 20000,
              lastActivity: new Date().toISOString(),
            },
          ],
          expensesByCategory: [
            {
              category: "Operacional",
              amount: 50000,
              percentage: 60,
              transactions: 25,
            },
          ],
        },
      };
    };

    const generateChartData = () => {
      const data = [];
      const currentYear = filters.year || new Date().getFullYear();
      const currentMonth = filters.month || new Date().getMonth() + 1;
      const currentQuarter = filters.quarter || Math.ceil(currentMonth / 3);

      const generateFinancialData = () => {
        const receitas = Math.random() * 400000 + 200000;
        const despesas = Math.random() * 300000 + 150000;
        const lucro = receitas - despesas;
        
        return {
          receitas,
          despesas,
          lucro,
          receitaBruta: receitas * 1.1,
          receitaLiquida: receitas * 0.95,
          operacao: receitas * 0.8,
          despesasFixas: despesas * 0.6,
          despesasVariaveis: despesas * 0.4,
          resultadoBruto: lucro * 1.2,
          resultadoLiquido: lucro,
          resultadoOperacional: lucro * 0.9,
          pis: receitas * 0.0165,
          cofins: receitas * 0.076,
          csll: lucro * 1.2 * 0.09,
          irpj: lucro * 1.2 * 0.15,
          issqn: receitas * 0.02,
          iof: receitas * 0.0038,
          advalores: receitas * 0.01,
          fator: 1.2 + Math.random() * 0.3,
          margem: (lucro / receitas) * 100,
        };
      };

      if (filters.period === "month") {
        for (let i = 5; i >= 0; i--) {
          const month = currentMonth - i;
          const adjustedMonth = month <= 0 ? month + 12 : month;
          const year = month <= 0 ? currentYear - 1 : currentYear;
          
          data.push({
            period: `${adjustedMonth.toString().padStart(2, '0')}/${year}`,
            ...generateFinancialData(),
          });
        }
      } else if (filters.period === "quarter") {
        for (let i = 3; i >= 0; i--) {
          const quarter = currentQuarter - i;
          const adjustedQuarter = quarter <= 0 ? quarter + 4 : quarter;
          const year = quarter <= 0 ? currentYear - 1 : currentYear;
          
          data.push({
            period: `Q${adjustedQuarter}/${year}`,
            ...generateFinancialData(),
          });
        }
      } else {
        for (let i = 2; i >= 0; i--) {
          const year = currentYear - i;
          
          data.push({
            period: `${year}`,
            ...generateFinancialData(),
          });
        }
      }

      return data;
    };

    return generateExampleData();
  }, [data, filters]);

  // Função para resetar filtros
  const resetFilters = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const currentQuarter = Math.ceil(currentMonth / 3);

    const defaultFilters: DashboardFilterParams = {
      period: "quarter",
      year: currentYear,
      quarter: currentQuarter,
      includeRevenues: true,
      includeExpenses: true,
      includeInvestments: true,
    };

    setFilters(defaultFilters);
  };

  // Função para exportar dados
  const exportData = () => {
    if (!processedData) return;

    const exportObj = {
      filters,
      periodLabel: getPeriodLabel,
      summary: processedData.summary,
      stats: processedData.stats,
      chartData: processedData.chartData,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(exportObj, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-data-${filters.year}-${filters.period}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return {
    // Dados
    data: processedData,
    chartData: processedData?.chartData || [],
    
    // Estados
    isLoading,
    error,
    
    // Filtros e configurações
    filters,
    updateFilters,
    resetFilters,
    
    // Informações do período
    currentPeriod,
    periodLabel: getPeriodLabel,
    
    // Funções utilitárias
    refetch,
    exportData,
    
    // Controles de período rápido
    setQuarterlyView: (year: number, quarter: number) => 
      updateFilters({ period: "quarter", year, quarter }),
    setMonthlyView: (year: number, month: number) => 
      updateFilters({ period: "month", year, month }),
    setYearlyView: (year: number) => 
      updateFilters({ period: "year", year }),
  };
} 
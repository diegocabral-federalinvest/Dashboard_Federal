/**
 * 🏦 Financial Data Service
 * 
 * Serviço centralizado para gerenciar todos os dados financeiros da aplicação.
 * Unifica as funcionalidades do DRE e Dashboard em uma única fonte de verdade.
 */

import { z } from "zod";
import logger from "@/lib/logger";

// ===== INTERFACES UNIFICADAS =====

export interface Period {
  year: number | null; // Permite null para "todos os anos"
  month?: number;
  quarter?: number;
  periodType: "monthly" | "quarterly" | "annual";
  deducaoFiscal?: number;
}

export interface BaseFinancialData {
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
  despesas: {
    operacionais: number;
    tributaveis: number;
    total: number;
  };
  impostos: {
    pis: number;
    cofins: number;
    issqn: number;
    ir: number;
    csll: number;
    total: number;
  };
  deducaoFiscal: number;
  resultadoBruto: number;
  resultadoOperacional: number;
  resultadoLiquido: number;
}

export interface InvestmentData {
  totalInvestments: number;
  activeInvestors: number;
  totalReturns: number;
  totalContributions: number;
}

export interface OperationalData {
  operationsTotal: number;
  operationsPrevious: number;
  operationsCount: number;
}

export interface UnifiedFinancialData extends BaseFinancialData {
  // Dados específicos do Dashboard
  investments?: InvestmentData;
  operational?: OperationalData;
  
  // Estatísticas comparativas
  stats: {
    netProfit: number;
    netProfitPrevious: number;
    netProfitGrowth: number;
    projectedTaxes: number;
    totalExpenses: number;
    expensesPrevious: number;
    expensesGrowth: number;
    totalRevenues: number;
    balance: number;
  } & Partial<InvestmentData & OperationalData>;
  
  // Dados para gráficos
  chartData: ChartDataPoint[];
}

export interface ChartDataPoint {
  period: string;
  receitas: number;
  despesas: number;
  lucro: number;
  receitaBruta?: number;
  receitaLiquida?: number;
  operacao?: number;
  despesasFixas?: number;
  despesasVariaveis?: number;
  resultadoBruto?: number;
  resultadoLiquido?: number;
  resultadoOperacional?: number;
  pis?: number;
  cofins?: number;
  csll?: number;
  irpj?: number;
  issqn?: number;
  iof?: number;
  advalores?: number;
  fator?: number;
  margem?: number;
}

export interface FinancialDataParams {
  year: number | null; // Permite null para "todos os anos"
  month?: number;
  quarter?: number;
  isAnnual?: boolean;
  includeInvestments?: boolean;
  includeOperational?: boolean;
  includePreviousPeriod?: boolean;
}

// ===== SCHEMAS DE VALIDAÇÃO =====

const periodSchema = z.object({
  year: z.union([z.number().min(2020).max(2030), z.null()]), // Permite null para "todos os anos"
  month: z.number().min(1).max(12).optional(),
  quarter: z.number().min(1).max(4).optional(),
  periodType: z.enum(["monthly", "quarterly", "annual"]),
  deducaoFiscal: z.number().min(0).optional().default(0),
});

const financialDataParamsSchema = z.object({
  year: z.union([z.number(), z.null()]), // Permite null para "todos os anos"
  month: z.number().optional(),
  quarter: z.number().optional(),
  isAnnual: z.boolean().optional(),
  includeInvestments: z.boolean().optional().default(true),
  includeOperational: z.boolean().optional().default(true),
  includePreviousPeriod: z.boolean().optional().default(true),
});

// ===== UTILITÁRIOS =====

export class PeriodUtils {
  static validatePeriod(period: any): Period {
    const result = periodSchema.safeParse(period);
    if (!result.success) {
      throw new Error(`Período inválido: ${result.error.errors.map(e => e.message).join(', ')}`);
    }
    return result.data;
  }

  static generateCacheKey(period: Period): string {
    const yearKey = period.year === null ? "all" : period.year;
    return `financial_data_${period.periodType}_${yearKey}_${period.quarter || period.month || 0}_${period.deducaoFiscal || 0}`;
  }

  static getPeriodLabel(period: Period): string {
    const monthNames = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    
    // Se year é null, significa "todos os anos"
    const yearDisplay = period.year === null ? "Todos os Anos" : period.year.toString();
    
    if (period.periodType === "monthly" && period.month) {
      return period.year === null ? 
        `${monthNames[period.month - 1]} - ${yearDisplay}` : 
        `${monthNames[period.month - 1]} de ${period.year}`;
    } else if (period.periodType === "quarterly" && period.quarter) {
      const quarterLabels = [
        "1º Trimestre (Jan-Mar)",
        "2º Trimestre (Abr-Jun)",
        "3º Trimestre (Jul-Set)",
        "4º Trimestre (Out-Dez)"
      ];
      return period.year === null ? 
        `${quarterLabels[period.quarter - 1]} - ${yearDisplay}` : 
        `${quarterLabels[period.quarter - 1]} de ${period.year}`;
    } else {
      return period.year === null ? yearDisplay : `Ano de ${period.year}`;
    }
  }

  static getDateRange(period: Period): { startDate: Date; endDate: Date } {
    let startDate: Date;
    let endDate: Date;

    // Se year é null, definir range para "todos os anos" (2020-2030)
    if (period.year === null) {
      startDate = new Date(2020, 0, 1);
      endDate = new Date(2030, 11, 31, 23, 59, 59);
      return { startDate, endDate };
    }

    if (period.periodType === "annual") {
      startDate = new Date(period.year, 0, 1);
      endDate = new Date(period.year, 11, 31, 23, 59, 59);
    } else if (period.periodType === "quarterly" && period.quarter) {
      const quarterStart = (period.quarter - 1) * 3;
      startDate = new Date(period.year, quarterStart, 1);
      endDate = new Date(period.year, quarterStart + 3, 0, 23, 59, 59);
    } else if (period.periodType === "monthly" && period.month) {
      startDate = new Date(period.year, period.month - 1, 1);
      endDate = new Date(period.year, period.month, 0, 23, 59, 59);
    } else {
      // Fallback para mês atual
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    return { startDate, endDate };
  }

  static getPreviousPeriod(period: Period): Period {
    // Se year é null (todos os anos), não há período anterior válido
    if (period.year === null) {
      return period;
    }

    if (period.periodType === "annual") {
      return { ...period, year: period.year - 1 };
    } else if (period.periodType === "quarterly" && period.quarter) {
      const prevQuarter = period.quarter === 1 ? 4 : period.quarter - 1;
      const prevYear = period.quarter === 1 ? period.year - 1 : period.year;
      return { ...period, quarter: prevQuarter, year: prevYear };
    } else if (period.periodType === "monthly" && period.month) {
      const prevMonth = period.month === 1 ? 12 : period.month - 1;
      const prevYear = period.month === 1 ? period.year - 1 : period.year;
      return { ...period, month: prevMonth, year: prevYear };
    }
    return period;
  }
}

// ===== SERVIÇO PRINCIPAL =====

export class FinancialDataService {
  private static instance: FinancialDataService;
  private cache = new Map<string, { data: UnifiedFinancialData; timestamp: number; ttl: number }>();
  
  // TTL dinâmico baseado no tipo de período
  private getTTL(period: Period): number {
    if (period.periodType === "annual") {
      return 15 * 60 * 1000; // 15 minutos para dados anuais
    } else if (period.periodType === "quarterly") {
      return 10 * 60 * 1000; // 10 minutos para dados trimestrais
    } else {
      return 3 * 60 * 1000; // 3 minutos para dados mensais
    }
  }

  static getInstance(): FinancialDataService {
    if (!this.instance) {
      this.instance = new FinancialDataService();
    }
    return this.instance;
  }

  /**
   * Busca dados financeiros unificados - funciona tanto para DRE quanto Dashboard
   */
  async getFinancialData(params: FinancialDataParams): Promise<UnifiedFinancialData> {
    const validatedParams = financialDataParamsSchema.parse(params);
    
    const period: Period = {
      year: validatedParams.year,
      month: validatedParams.month,
      quarter: validatedParams.quarter,
      periodType: validatedParams.isAnnual ? "annual" : 
                 validatedParams.quarter ? "quarterly" : "monthly"
    };

    const cacheKey = PeriodUtils.generateCacheKey(period);
    
    // Verificar cache primeiro
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      logger.debug("Dados financeiros obtidos do cache", {
        source: "frontend",
        context: "financial-data-service",
        tags: ["cache", "hit"],
        data: { cacheKey }
      });
      return cached;
    }

    logger.info("Buscando dados financeiros", {
      source: "frontend",
      context: "financial-data-service",
      tags: ["api", "request"],
      data: { params: validatedParams }
    });

    try {
      // Fazer todas as chamadas em paralelo para máxima performance
      const [baseData, investmentData, operationalData, previousPeriodData] = await Promise.all([
        this.fetchBaseFinancialData(validatedParams),
        validatedParams.includeInvestments ? this.fetchInvestmentData(validatedParams) : Promise.resolve(null),
        validatedParams.includeOperational ? this.fetchOperationalData(validatedParams) : Promise.resolve(null),
        validatedParams.includePreviousPeriod ? this.fetchPreviousPeriodData(validatedParams) : Promise.resolve(null)
      ]);

      // Combinar todos os dados
      const unifiedData = this.combineFinancialData(
        baseData,
        investmentData,
        operationalData,
        previousPeriodData
      );

      // Salvar no cache com TTL apropriado
      this.saveToCache(cacheKey, unifiedData, period);

      logger.info("Dados financeiros obtidos com sucesso", {
        source: "frontend",
        context: "financial-data-service",
        tags: ["api", "success"],
        data: { 
          cacheKey,
          resultadoLiquido: unifiedData.resultadoLiquido,
          receitas: unifiedData.receitas.total
        }
      });

      return unifiedData;
    } catch (error) {
      logger.error("Erro ao buscar dados financeiros", {
        source: "frontend",
        context: "financial-data-service",
        tags: ["api", "error"],
        data: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  /**
   * Busca dados base do DRE (sempre necessário)
   */
  private async fetchBaseFinancialData(params: FinancialDataParams): Promise<BaseFinancialData> {
    const queryParams = new URLSearchParams();
    
    // CORREÇÃO: Sempre passar o year, mesmo quando null (para "todos os anos")
    // Se year for null, passar "null" como string para a API identificar
    if (params.year !== null) {
      queryParams.append("year", params.year.toString());
    } else {
      queryParams.append("year", "null"); // Identificar explicitamente "todos os anos"
    }
    
    if (params.isAnnual) {
      queryParams.append("annual", "true");
    } else if (params.quarter) {
      const monthValue = (params.quarter - 1) * 3 + 1;
      queryParams.append("month", monthValue.toString());
      queryParams.append("quarterly", "true");
    } else if (params.month) {
      queryParams.append("month", params.month.toString());
    }

    const response = await fetch(`/api/reports/dre?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar dados base: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Busca dados de investimentos (opcional)
   */
  private async fetchInvestmentData(params: FinancialDataParams): Promise<InvestmentData | null> {
    try {
      const baseParams: Record<string, string> = {
        period: params.isAnnual ? "year" : params.quarter ? "quarter" : "month",
      };
      
      // Adicionar year apenas se não for null
      if (params.year !== null) {
        baseParams.year = params.year.toString();
      }
      
      const queryParams = new URLSearchParams({
        ...baseParams,
        ...(params.month && { month: params.month.toString() }),
        ...(params.quarter && { quarter: params.quarter.toString() }),
        ...(params.isAnnual && { isAnnual: "true" }),
        includeInvestments: "true"
      });

      const response = await fetch(`/api/finance?${queryParams.toString()}`);
      
      if (!response.ok) {
        logger.warn("Erro ao buscar dados de investimentos", {
          source: "frontend",
          context: "financial-data-service",
          tags: ["investment", "warning"],
          data: { status: response.status }
        });
        return null;
      }

      const data = await response.json();
      return {
        totalInvestments: data.stats?.totalInvestments || 0,
        activeInvestors: data.stats?.activeInvestors || 0,
        totalReturns: data.stats?.totalReturns || 0,
        totalContributions: data.stats?.totalContributions || 0,
      };
    } catch (error) {
      logger.warn("Falha ao buscar dados de investimentos", {
        source: "frontend",
        context: "financial-data-service",
        tags: ["investment", "error"],
        data: { error: error instanceof Error ? error.message : String(error) }
      });
      return null;
    }
  }

  /**
   * Busca dados operacionais (opcional)
   */
  private async fetchOperationalData(params: FinancialDataParams): Promise<OperationalData | null> {
    try {
      const baseParams: Record<string, string> = {
        period: params.isAnnual ? "year" : params.quarter ? "quarter" : "month",
        includeOperational: "true"
      };
      
      // Adicionar year apenas se não for null
      if (params.year !== null) {
        baseParams.year = params.year.toString();
      }
      
      const queryParams = new URLSearchParams({
        ...baseParams,
        ...(params.month && { month: params.month.toString() }),
        ...(params.quarter && { quarter: params.quarter.toString() }),
        ...(params.isAnnual && { isAnnual: "true" }),
      });

      const response = await fetch(`/api/finance?${queryParams.toString()}`);
      
      if (!response.ok) {
        logger.warn("Erro ao buscar dados operacionais", {
          source: "frontend",
          context: "financial-data-service",
          tags: ["operational", "warning"],
          data: { status: response.status }
        });
        return null;
      }

      const data = await response.json();
      return {
        operationsTotal: data.stats?.operationsTotal || 0,
        operationsPrevious: data.stats?.operationsPrevious || 0,
        operationsCount: data.stats?.operationsCount || 0,
      };
    } catch (error) {
      logger.warn("Falha ao buscar dados operacionais", {
        source: "frontend",
        context: "financial-data-service",
        tags: ["operational", "error"],
        data: { error: error instanceof Error ? error.message : String(error) }
      });
      return null;
    }
  }

  /**
   * Busca dados do período anterior para comparação
   */
  private async fetchPreviousPeriodData(params: FinancialDataParams): Promise<BaseFinancialData | null> {
    try {
      const currentPeriod: Period = {
        year: params.year,
        month: params.month,
        quarter: params.quarter,
        periodType: params.isAnnual ? "annual" : params.quarter ? "quarterly" : "monthly"
      };

      const previousPeriod = PeriodUtils.getPreviousPeriod(currentPeriod);
      
      const previousParams: FinancialDataParams = {
        year: previousPeriod.year,
        month: previousPeriod.month,
        quarter: previousPeriod.quarter,
        isAnnual: previousPeriod.periodType === "annual",
        includeInvestments: false,
        includeOperational: false,
        includePreviousPeriod: false // Evitar recursão
      };

      return await this.fetchBaseFinancialData(previousParams);
    } catch (error) {
      logger.warn("Falha ao buscar dados do período anterior", {
        source: "frontend",
        context: "financial-data-service",
        tags: ["previous-period", "error"],
        data: { error: error instanceof Error ? error.message : String(error) }
      });
      return null;
    }
  }

  /**
   * Combina todos os dados em uma estrutura unificada
   */
  private combineFinancialData(
    baseData: BaseFinancialData,
    investmentData: InvestmentData | null,
    operationalData: OperationalData | null,
    previousData: BaseFinancialData | null
  ): UnifiedFinancialData {
    // Função auxiliar para garantir números válidos
    const safeNumber = (value: any, fallback: number = 0): number => {
      if (value === null || value === undefined) return fallback;
      const num = Number(value);
      return !isNaN(num) && isFinite(num) ? num : fallback;
    };

    // Calcular estatísticas comparativas com valores seguros
    const netProfit = safeNumber(baseData.resultadoLiquido);
    const netProfitPrevious = safeNumber(previousData?.resultadoLiquido);
    const netProfitGrowth = netProfitPrevious !== 0 
      ? ((netProfit - netProfitPrevious) / Math.abs(netProfitPrevious)) * 100 
      : 0;

    const totalExpenses = safeNumber(baseData.despesas.total);
    const expensesPrevious = safeNumber(previousData?.despesas.total);
    const expensesGrowth = expensesPrevious !== 0
      ? ((totalExpenses - expensesPrevious) / Math.abs(expensesPrevious)) * 100
      : 0;

    const projectedTaxes = Math.max(0, safeNumber(baseData.resultadoBruto) * 0.24); // 24% total

    // Gerar dados para gráficos baseados no período
    const chartData: ChartDataPoint[] = this.generateChartDataForPeriod(
      baseData, 
      {
        year: baseData.periodo.ano,
        month: baseData.periodo.mes,
        quarter: baseData.periodo.trimestral ? Math.ceil(baseData.periodo.mes / 3) : undefined,
        periodType: baseData.periodo.anual ? "annual" : 
                   baseData.periodo.trimestral ? "quarterly" : "monthly"
      },
      previousData
    );

    return {
      ...baseData,
      investments: investmentData || undefined,
      operational: operationalData || undefined,
      stats: {
        netProfit,
        netProfitPrevious,
        netProfitGrowth: safeNumber(netProfitGrowth),
        projectedTaxes,
        totalExpenses,
        expensesPrevious,
        expensesGrowth: safeNumber(expensesGrowth),
        totalRevenues: safeNumber(baseData.receitas.total),
        balance: safeNumber(baseData.receitas.total) - safeNumber(baseData.despesas.total),
        // Usar valores seguros das operações do DRE
        operationsTotal: safeNumber(baseData.receitas.operacoes), // Valor específico das operações (correção da inconsistência)
        operationsPrevious: safeNumber(previousData?.receitas.operacoes), // Valor das operações do período anterior
        operationsCount: safeNumber(operationalData?.operationsCount, 1), // Evitar divisão por zero
        // Dados de investimento com valores seguros
        totalInvestments: safeNumber(investmentData?.totalInvestments),
        activeInvestors: safeNumber(investmentData?.activeInvestors),
        totalReturns: safeNumber(investmentData?.totalReturns),
        totalContributions: safeNumber(investmentData?.totalContributions),
      },
      chartData,
    };
  }

  /**
   * Verifica cache e aplica limpeza automática se necessário
   */
  private getFromCache(key: string): UnifiedFinancialData | null {
    // Limpeza automática a cada 50 acessos para evitar memory leak
    if (this.cache.size > 50) {
      this.cleanExpiredCache();
    }
    
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key); // Remove cache expirado
    }
    return null;
  }

  private saveToCache(key: string, data: UnifiedFinancialData, period: Period): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl: this.getTTL(period) });
  }

  /**
   * Remove entradas de cache expiradas
   */
  private cleanExpiredCache(): void {
    const now = Date.now();
    Array.from(this.cache.entries()).forEach(([key, value]) => {
      if (now - value.timestamp > value.ttl) {
        this.cache.delete(key);
      }
    });
  }

  /**
   * Gera dados de gráfico baseados no período (versão simplificada)
   */
  private generateChartDataForPeriod(
    baseData: BaseFinancialData,
    period: Period,
    previousData: BaseFinancialData | null
  ): ChartDataPoint[] {
    const chartData: ChartDataPoint[] = [];

    if (period.periodType === "annual") {
      // Gerar 12 meses com dados simulados baseados no atual
      const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      
      for (let month = 1; month <= 12; month++) {
        // Simular variação de ±30% nos dados
        const variation = 0.7 + Math.random() * 0.6; // 70% a 130%
        
        chartData.push({
          period: monthNames[month - 1],
          receitas: Math.round(baseData.receitas.total * variation),
          despesas: Math.round(baseData.despesas.total * variation),
          lucro: Math.round(baseData.resultadoLiquido * variation),
          operacao: Math.round(baseData.receitas.operacoes * variation),
          resultadoBruto: Math.round(baseData.resultadoBruto * variation),
          resultadoLiquido: Math.round(baseData.resultadoLiquido * variation),
          resultadoOperacional: Math.round(baseData.resultadoOperacional * variation),
          pis: Math.round(baseData.impostos.pis * variation),
          cofins: Math.round(baseData.impostos.cofins * variation),
          csll: Math.round(baseData.impostos.csll * variation),
          irpj: Math.round(baseData.impostos.ir * variation),
          issqn: Math.round(baseData.impostos.issqn * variation),
          iof: Math.round(baseData.custos.iof * variation),
          advalores: Math.round(baseData.custos.adValorem * variation),
          fator: Math.round(baseData.custos.fator * variation),
          margem: baseData.receitas.total > 0 ? (baseData.resultadoLiquido / baseData.receitas.total) * 100 * variation : 0,
        });
      }
    } else if (period.periodType === "quarterly" && period.quarter) {
      // Gerar 3 meses do trimestre
      const quarterMonths = {
        1: ["Jan", "Fev", "Mar"],
        2: ["Abr", "Mai", "Jun"], 
        3: ["Jul", "Ago", "Set"],
        4: ["Out", "Nov", "Dez"]
      };
      
      const months = quarterMonths[period.quarter as keyof typeof quarterMonths];
      
      for (let i = 0; i < 3; i++) {
        const variation = 0.8 + Math.random() * 0.4; // 80% a 120%
        
        chartData.push({
          period: months[i],
          receitas: Math.round(baseData.receitas.total * variation),
          despesas: Math.round(baseData.despesas.total * variation),
          lucro: Math.round(baseData.resultadoLiquido * variation),
          operacao: Math.round(baseData.receitas.operacoes * variation),
          resultadoBruto: Math.round(baseData.resultadoBruto * variation),
          resultadoLiquido: Math.round(baseData.resultadoLiquido * variation),
          resultadoOperacional: Math.round(baseData.resultadoOperacional * variation),
          pis: Math.round(baseData.impostos.pis * variation),
          cofins: Math.round(baseData.impostos.cofins * variation),
          csll: Math.round(baseData.impostos.csll * variation),
          irpj: Math.round(baseData.impostos.ir * variation),
          issqn: Math.round(baseData.impostos.issqn * variation),
          iof: Math.round(baseData.custos.iof * variation),
          advalores: Math.round(baseData.custos.adValorem * variation),
          fator: Math.round(baseData.custos.fator * variation),
          margem: baseData.receitas.total > 0 ? (baseData.resultadoLiquido / baseData.receitas.total) * 100 * variation : 0,
        });
      }
    } else {
      // Mensal: mostrar dados do mês atual e alguns pontos anteriores
      const currentPoint = {
        period: PeriodUtils.getPeriodLabel(period),
        receitas: baseData.receitas.total,
        despesas: baseData.despesas.total,
        lucro: baseData.resultadoLiquido,
        operacao: baseData.receitas.operacoes,
        resultadoBruto: baseData.resultadoBruto,
        resultadoLiquido: baseData.resultadoLiquido,
        resultadoOperacional: baseData.resultadoOperacional,
        pis: baseData.impostos.pis,
        cofins: baseData.impostos.cofins,
        csll: baseData.impostos.csll,
        irpj: baseData.impostos.ir,
        issqn: baseData.impostos.issqn,
        iof: baseData.custos.iof,
        advalores: baseData.custos.adValorem,
        fator: baseData.custos.fator,
        margem: baseData.receitas.total > 0 ? (baseData.resultadoLiquido / baseData.receitas.total) * 100 : 0,
      };
      
      // Adicionar ponto do mês anterior se disponível
      if (previousData) {
        const previousPeriod = PeriodUtils.getPreviousPeriod(period);
        chartData.push({
          period: PeriodUtils.getPeriodLabel(previousPeriod),
          receitas: previousData.receitas.total,
          despesas: previousData.despesas.total,
          lucro: previousData.resultadoLiquido,
          operacao: previousData.receitas.operacoes,
          resultadoBruto: previousData.resultadoBruto,
          resultadoLiquido: previousData.resultadoLiquido,
          resultadoOperacional: previousData.resultadoOperacional,
          pis: previousData.impostos.pis,
          cofins: previousData.impostos.cofins,
          csll: previousData.impostos.csll,
          irpj: previousData.impostos.ir,
          issqn: previousData.impostos.issqn,
          iof: previousData.custos.iof,
          advalores: previousData.custos.adValorem,
          fator: previousData.custos.fator,
          margem: previousData.receitas.total > 0 ? (previousData.resultadoLiquido / previousData.receitas.total) * 100 : 0,
        });
      }
      
      chartData.push(currentPoint);
    }

    return chartData;
  }

  /**
   * Limpa o cache
   */
  clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of Array.from(this.cache.keys())) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  /**
   * Atualiza dedução fiscal e recalcula impostos
   */
  async updateTaxDeduction(period: Period, deduction: number): Promise<void> {
    try {
      const response = await fetch('/api/finance/tax_deduction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: period.year,
          quarter: period.quarter,
          value: deduction
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar dedução fiscal');
      }

      // Invalidar cache para este período
      const cacheKey = PeriodUtils.generateCacheKey({ ...period, deducaoFiscal: deduction });
      this.clearCache(cacheKey);

      logger.info("Dedução fiscal atualizada", {
        source: "frontend",
        context: "financial-data-service",
        tags: ["tax-deduction", "update"],
        data: { period, deduction }
      });
    } catch (error) {
      logger.error("Erro ao atualizar dedução fiscal", {
        source: "frontend",
        context: "financial-data-service",
        tags: ["tax-deduction", "error"],
        data: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }
}

// ===== INSTÂNCIA SINGLETON =====
export const financialDataService = FinancialDataService.getInstance(); 
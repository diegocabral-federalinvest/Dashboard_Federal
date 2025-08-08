enum IsPosititiveOrNegative {
  POSITIVE = "positive",
  NEGATIVE = "negative",
}

// Types for dashboard data
export interface DashboardData {
  summary: {
    grossRevenue: number;
    netRevenue: number;
    taxableExpenses: number;
    nonTaxableExpenses: number;
    grossProfit: number;
    netProfit: number;
  };
  // Card Stats - baseado na imagem dashAntigo.jpg
  stats: {
    // Card 1: Resultado Líquido
    netProfit: number;
    netProfitPrevious: number;
    netProfitGrowth: number;
    projectedTaxes: number;
    netProfitChange: string;
    netProfitChangeType: IsPosititiveOrNegative;
    lastQuarter: number;
    growthRate: number;
    taxProjection: number;
    
    // Card 2: Despesas & Entradas
    totalExpenses: number;
    expensesPrevious: number;
    expensesGrowth: number;
    totalRevenues: number;
    balance: number;
    
    // Card 3: Investimentos
    totalInvestments: number;
    activeInvestors: number;
    totalReturns: number;
    totalContributions: number;
    
    // Card 4: Operações
    operationsTotal: number;
    operationsPrevious: number;
    operationsCount: number;
    totalOperations: number;
    lastMonthOps: number;
    totalOperationsCount: number;
    
    // Dados legados (manter compatibilidade)
    grossRevenue: number;
    grossRevenueChange: string;
    grossRevenueChangeType: IsPosititiveOrNegative;
    netRevenue: number;
    netRevenueChange: string;
    netRevenueChangeType: IsPosititiveOrNegative;
    grossProfit: number;
    grossProfitChange: string;
      grossProfitChangeType: IsPosititiveOrNegative;
  };
  // Chart data for visualizations
  chartData: Array<{
    period: string;
    receitas: number;
    despesas: number;
    lucro: number;
  }>;
  charts: {
    revenue: any[];
    expenses: any[];
    profit: any[];
    evolution: any[];
    distribution: any[];
    comparison: any[];
    projections: any[];
  };
  indicators: {
    grossMargin: number;
    netMargin: number;
    yoyGrowth: number;
    efficiencyRatio: number;
  };
  operations: {
    recent: Array<{ description: string; amount: number }>;
    pending: Array<{ description: string; amount: number }>;
  };
  // Dados reais do banco de dados
  tables: {
    recentTransactions: Array<{
      id: string;
      description: string;
      amount: number;
      date: string;
      type: "income" | "expense";
      category: string;
    }>;
    activeInvestors: Array<{
      id: string;
      name: string;
      totalInvested: number;
      currentValue: number;
      returns: number;
      lastActivity: string;
    }>;
    expensesByCategory: Array<{
      category: string;
      amount: number;
      percentage: number;
      transactions: number;
    }>;
  };
}

// Filter parameters for dashboard data
export interface DashboardFilterParams {
  period: string;
  year?: number;
  month?: number;
  quarter?: number;
  isAnnual?: boolean;
  startDate?: string;
  endDate?: string;
  includeRevenues?: boolean;
  includeExpenses?: boolean;
  includeInvestments?: boolean;
} 
// Tipos do Dashboard do Investidor

export interface InvestorData {
  linked: boolean;
  investor?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface InvestmentFlowRecord {
  id: string;
  date: string;
  caixaInicial: number;
  aporte: number;
  totalAportado: number;
  caixaAporte: number;
  retornoMensal: number;
  totalRetornado: number;
  caixaFinal: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  invested: number;
  returns: number;
}

export interface DashboardStats {
  totalInvested: number;
  totalReturns: number;
  currentBalance: number;
  returnPercentage: number;
  dailyReturnRate: number;
}

export interface BalanceCardProps {
  totalBalance: number;
  totalInvested: number;
  returnPercentage: number;
  currentReturn: number;
}

export interface PortfolioChartProps {
  data: ChartDataPoint[];
  currentBalance: number;
  totalInvested: number;
} 
export interface Investment {
  id: string;
  investorId: string;
  investorName: string;
  date: string;
  value: number;
  type: 'aporte' | 'retirada';
  status: 'active' | 'completed' | 'withdrawn';
  returnRate: number;
  description: string;
  startDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Investor {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  totalInvested: number;
  userId?: string;
}

export interface InvestmentCalculation {
  id: string; // ID único do investment original para CRUD operations
  investorId: string;
  investorName: string;
  date: string;
  caixaInicial: number; // Saldo antes do aporte
  aporte: number; // Valor do aporte atual
  totalAportado: number; // Soma de todos os aportes até agora
  caixaInicialMaisAporte: number; // Caixa inicial + aporte atual
  retornoPorcentagem: number; // Taxa de retorno (1.2%)
  diasRendimento: number; // Dias desde último aporte
  totalRetornado: number; // Rendimentos acumulados
  caixaFinal: number; // Saldo total atual
  rendimentoPeriodo: number; // Rendimento do período atual
}

export interface ChartDataPoint {
  date: string;
  saldoTotal: number;
  totalAportado: number;
  totalRendimento: number;
  investorName?: string;
}

export interface InvestmentStats {
  totalInvestment: number;
  totalReturns: number;
  totalWithdrawn: number;
  activeInvestors: number;
  returnPercentage: number;
  averageInvestmentPerInvestor: number;
}

export interface InvestmentFilters {
  search?: string;
  investorId?: string;
  type: 'all' | 'aporte' | 'retirada';
  status: 'all' | 'active' | 'completed' | 'withdrawn';
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface TabState {
  activeTab: 'overview' | 'contributions' | 'investors' | 'analytics';
}

export interface DialogState {
  isNewInvestmentOpen: boolean;
  isInvestorRegistrationOpen: boolean;
  selectedInvestor: string;
  investmentAmount: string;
  selectedDate?: Date;
}

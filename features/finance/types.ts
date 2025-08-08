/**
 * Tipos relacionados a finanças no sistema
 */

// Tipo para período financeiro
export interface Period {
  month?: number;
  quarter?: number;
  year: number | null; // Permite null para "todos os anos"
  deducaoFiscal?: number;
  periodType: "monthly" | "quarterly" | "annual";
}

// Tipo para dados de investimento
export interface Investment {
  id: string;
  investorId: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  date: Date | string;
  description?: string;
}

// Tipo para dados de despesa
export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: Date | string;
  category: string;
  isTaxable: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Tipo para dados de receita
export interface Revenue {
  id: string;
  description: string;
  amount: number;
  date: Date | string;
  category: string;
  source: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Tipo para categorias de despesas
export type ExpenseCategory = 
  | 'operacional'
  | 'administrativo'
  | 'marketing'
  | 'financeiro'
  | 'tecnologia'
  | 'tributavel'
  | 'outros';

// Tipo para categorias de receitas
export type RevenueCategory = 
  | 'operacoes'
  | 'servicos'
  | 'rendimentos'
  | 'outros';

// Tipo para períodos de tempo
export type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'; 
// Types para a página de operações financeiras
type BaseData = { 
    name: string | null; 
    value: number | null
};

export interface FinancialOperation {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: 'expense' | 'entry';
  status: 'pending' | 'completed' | 'cancelled';
  isTaxable?: boolean;
  isPayroll?: boolean;
  // Campos auxiliares para depuração rápida na UI
  rawCategoryId?: string | null;
  rawIsPayroll?: unknown;
  rawIsTaxable?: unknown;
}


type EntriesExpenses = {
  entries: number;
  expenses: number;
};

export interface ChartDataPoint extends BaseData, Partial<EntriesExpenses> {}

export interface MonthlyData extends Omit<BaseData, 'value'>, EntriesExpenses {}


export type CategoryData = BaseData;

export type FinancialSummary = Record<
  | 'totalExpenses'
  | 'totalEntries'
  | 'netResult'
  | 'payrollExpenses'
  | 'nonPayrollExpenses'
  | 'taxableExpenses'
  | 'nonTaxableExpenses'
  | 'totalOperationsCount'
  | 'payrollExpensesCount'
  | 'taxableExpensesCount',
  number
>;

export interface ProcessedFinancialData {
  summary: FinancialSummary;
  chartData: ChartDataPoint[];
  monthlyData: MonthlyData[];
  expenseCategoryData: CategoryData[];
  entryCategoryData: CategoryData[];
  allOperations: FinancialOperation[];
}

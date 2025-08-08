import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  EXPENSE_CATEGORIES, 
  ENTRY_CATEGORIES, 
  DEFAULT_MESSAGES,
  CHART_CONFIG 
} from "../_constants";
import type { 
  FinancialOperation, 
  ChartDataPoint, 
  CategoryData, 
  MonthlyData,
  FinancialSummary 
} from "../_types";

// Função para mapear IDs de categoria para nomes legíveis
export const getCategoryName = (categoryId: string | undefined | null, type: 'expense' | 'entry'): string => {
  if (!categoryId || categoryId.trim() === '') {
    return DEFAULT_MESSAGES.NO_CATEGORY;
  }

  const id = String(categoryId);
  const lc = id.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (type === 'expense') {
    // 1) tentativa direta por id
    const direct = EXPENSE_CATEGORIES[id as keyof typeof EXPENSE_CATEGORIES];
    if (direct) return direct;

    // 2) tentativa por id normalizado (ex: "Folha de Pagamento" -> "folha de pagamento")
    for (const [key, name] of Object.entries(EXPENSE_CATEGORIES)) {
      const keyLc = key.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const nameLc = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (lc === keyLc || lc === nameLc) {
        return name;
      }
    }

    // 3) fallback para mostrar o que veio do backend
    return id;
  } else {
    const direct = ENTRY_CATEGORIES[id as keyof typeof ENTRY_CATEGORIES];
    if (direct) return direct;

    for (const [key, name] of Object.entries(ENTRY_CATEGORIES)) {
      const keyLc = key.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const nameLc = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (lc === keyLc || lc === nameLc) {
        return name;
      }
    }

    return id;
  }
};

// Normalização robusta para booleans vindos do backend/formulários
export const coerceBoolean = (value: unknown): boolean => {
  if (value === true) return true;
  if (value === false) return false;
  if (value === 1 || value === '1') return true;
  if (value === 0 || value === '0') return false;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    return v === 'true' || v === 'yes' || v === 'sim' || v === 'on';
  }
  return Boolean(value);
};

// Função para calcular valor numérico seguro
export const safeNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  
  // Se for uma string, tentar converter
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return 0;
    const num = parseFloat(trimmed);
    return isNaN(num) ? 0 : num;
  }
  
  // Se for número, retornar diretamente
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value;
  }
  
  // Para outros tipos, tentar conversão padrão
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

// Função para calcular resumo financeiro
export const calculateFinancialSummary = (expenses: any[], entries: any[]): FinancialSummary => {
  const totalExpenses = expenses.reduce((sum, expense) => sum + safeNumber(expense.value), 0);
  const totalEntries = entries.reduce((sum, entry) => sum + safeNumber(entry.value), 0);
  const netResult = totalEntries - totalExpenses;

  const payrollExpenses = expenses
    .filter(expense => expense.isPayroll === true)
    .reduce((sum, expense) => sum + safeNumber(expense.value), 0);
  
  const nonPayrollExpenses = totalExpenses - payrollExpenses;
  
  const taxableExpenses = expenses
    .filter(expense => expense.isTaxable === true)
    .reduce((sum, expense) => sum + safeNumber(expense.value), 0);
  
  const nonTaxableExpenses = totalExpenses - taxableExpenses;

  const totalOperationsCount = expenses.length + entries.length;
  const payrollExpensesCount = expenses.filter(expense => expense.isPayroll === true).length;
  const taxableExpensesCount = expenses.filter(expense => expense.isTaxable === true).length;

  return {
    totalExpenses,
    totalEntries,
    netResult,
    payrollExpenses,
    nonPayrollExpenses,
    taxableExpenses,
    nonTaxableExpenses,
    totalOperationsCount,
    payrollExpensesCount,
    taxableExpensesCount
  };
};

// Função para gerar dados do gráfico diário
export const generateChartData = (expenses: any[], entries: any[]): ChartDataPoint[] => {
  if (!expenses || !entries) return [];
  
  const last30Days = Array.from({ length: CHART_CONFIG.DAYS_RANGE }, (_, i) => {
    const date = subDays(new Date(), CHART_CONFIG.DAYS_RANGE - 1 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    const dayExpenses = expenses
      .filter(expense => expense.date && expense.date.startsWith(dateStr))
      .reduce((sum, expense) => sum + safeNumber(expense.value), 0);
    
    const dayEntries = entries
      .filter(entry => entry.date && entry.date.startsWith(dateStr))
      .reduce((sum, entry) => sum + safeNumber(entry.value), 0);
    
    return {
      name: format(date, 'dd/MM'),
      entries: dayEntries,
      expenses: dayExpenses,
      value: dayEntries - dayExpenses
    };
  });

  return last30Days;
};

// Função para gerar dados mensais
export const generateMonthlyData = (expenses: any[], entries: any[]): MonthlyData[] => {
  if (!expenses || !entries) return [];
  
  const months = [];
  const now = new Date();
  
  for (let i = CHART_CONFIG.MONTHS_RANGE - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = format(date, 'MMM', { locale: ptBR });
    const yearMonth = format(date, 'yyyy-MM');
    
    const monthEntries = entries
      .filter(entry => entry.date && entry.date.startsWith(yearMonth))
      .reduce((sum, entry) => sum + safeNumber(entry.value), 0);
    
    const monthExpenses = expenses
      .filter(expense => expense.date && expense.date.startsWith(yearMonth))
      .reduce((sum, expense) => sum + safeNumber(expense.value), 0);
    
    months.push({
      name: monthName,
      entries: monthEntries,
      expenses: monthExpenses,
    });
  }
  
  return months;
};

// Função para gerar dados de categoria de despesas
export const generateExpenseCategoryData = (expenses: any[]): CategoryData[] => {
  if (!expenses || expenses.length === 0) {
    return [{ name: DEFAULT_MESSAGES.NO_DATA, value: 0 }];
  }
  
  const categoryTotals: Record<string, number> = {};
  
  expenses.forEach(expense => {
    const categoryName = getCategoryName(expense.categoryId, 'expense');
    const validValue = safeNumber(expense.value);
    categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + validValue;
  });
  
  const result = Object.entries(categoryTotals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, CHART_CONFIG.MAX_CATEGORIES);
  
  return result.length > 0 ? result : [{ name: DEFAULT_MESSAGES.NO_DATA, value: 0 }];
};

// Função para gerar dados de categoria de entradas
export const generateEntryCategoryData = (entries: any[]): CategoryData[] => {
  if (!entries || entries.length === 0) {
    return [{ name: DEFAULT_MESSAGES.NO_DATA, value: 0 }];
  }
  
  const categoryTotals: Record<string, number> = {};
  
  entries.forEach(entry => {
    const categoryName = getCategoryName(entry.categoryId, 'entry');
    const validValue = safeNumber(entry.value);
    categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + validValue;
  });
  
  const result = Object.entries(categoryTotals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, CHART_CONFIG.MAX_CATEGORIES);
  
  return result.length > 0 ? result : [{ name: DEFAULT_MESSAGES.NO_DATA, value: 0 }];
};

// Função para combinar e formatar dados para operações
export const formatAllOperations = (expenses: any[], entries: any[]): FinancialOperation[] => {
  // Ensure we have valid arrays
  const validExpenses = Array.isArray(expenses) ? expenses : [];
  const validEntries = Array.isArray(entries) ? entries : [];
  
  const formattedExpenses = validExpenses.map((expense, index) => {
    const validValue = safeNumber(expense.value);
    
    // Garantir que categoryId seja uma string válida ou null
    let expenseCategoryId = expense.categoryId;
    if (expenseCategoryId === undefined || expenseCategoryId === null || expenseCategoryId === "") {
      expenseCategoryId = null;
    } else if (typeof expenseCategoryId !== 'string') {
      expenseCategoryId = String(expenseCategoryId);
    }
    
    const categoryName = getCategoryName(expenseCategoryId, 'expense');
    
    // Ensure all required fields are present with correct types
    const formattedExpense: FinancialOperation = {
      id: String(expense.id || ''),
      description: String(expense.description || DEFAULT_MESSAGES.NO_DESCRIPTION),
      amount: Number(validValue),
      date: String(expense.date ? expense.date : new Date().toISOString()),
      category: String(categoryName),
      type: 'expense' as const,
      status: 'completed' as const,
      isTaxable: coerceBoolean(expense.isTaxable),
      isPayroll: coerceBoolean(expense.isPayroll),
      rawCategoryId: expenseCategoryId,
      rawIsPayroll: expense.isPayroll,
      rawIsTaxable: expense.isTaxable
    };
    
    return formattedExpense;
  });

  const formattedEntries = validEntries.map((entry, index) => {
    const validValue = safeNumber(entry.value);
    
    // Garantir que categoryId seja uma string válida ou null (mesmo tratamento que expenses)
    let entryCategoryId = entry.categoryId;
    if (entryCategoryId === undefined || entryCategoryId === null || entryCategoryId === "") {
      entryCategoryId = null;
    } else if (typeof entryCategoryId !== 'string') {
      entryCategoryId = String(entryCategoryId);
    }
    
    const categoryName = getCategoryName(entryCategoryId, 'entry');
    
    // Ensure all required fields are present with correct types
    const formattedEntry: FinancialOperation = {
      id: String(entry.id || ''),
      description: String(entry.description || entry.payee || DEFAULT_MESSAGES.NO_DESCRIPTION),
      amount: Number(validValue),
      date: String(entry.date ? entry.date : new Date().toISOString()),
      category: String(categoryName),
      type: 'entry' as const,
      status: 'completed' as const,
      isTaxable: false, // Entries don't have tax flags
      isPayroll: false,  // Entries don't have payroll flags
      rawCategoryId: entryCategoryId,
      rawIsPayroll: undefined,
      rawIsTaxable: undefined
    };
    
    return formattedEntry;
  });

  const allOperations = [...formattedExpenses, ...formattedEntries];
  
  // Validate that all operations have required fields before sorting
  const validOperations = allOperations.filter(operation => 
    operation && 
    typeof operation.id === 'string' && 
    typeof operation.description === 'string' && 
    typeof operation.amount === 'number' && 
    typeof operation.date === 'string' && 
    typeof operation.category === 'string' && 
    typeof operation.type === 'string'
  );
  
  return validOperations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

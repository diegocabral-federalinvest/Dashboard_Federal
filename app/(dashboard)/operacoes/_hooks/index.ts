import { useMemo } from "react";
import { useGetExpenses } from "@/features/expenses/api/use-get-expenses";
import { useGetEntries } from "@/features/entries/api/use-get-entries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/hono";
import { 
  calculateFinancialSummary,
  generateChartData,
  generateMonthlyData,
  generateExpenseCategoryData,
  generateEntryCategoryData,
  formatAllOperations
} from "../_helpers";
import type { ProcessedFinancialData } from "../_types";

// Hook principal para dados financeiros processados
export const useProcessedFinancialData = () => {
  // Fetch dos dados originais
  const { data: expenses = [], isLoading: isLoadingExpenses } = useGetExpenses();
  const { data: entries = [], isLoading: isLoadingEntries } = useGetEntries();

  const isLoading = isLoadingExpenses || isLoadingEntries;

  // Processar todos os dados financeiros
  const processedData: ProcessedFinancialData = useMemo(() => {
    if (isLoading) {
      return {
        summary: {
          totalExpenses: 0,
          totalEntries: 0,
          netResult: 0,
          payrollExpenses: 0,
          nonPayrollExpenses: 0,
          taxableExpenses: 0,
          nonTaxableExpenses: 0,
          totalOperationsCount: 0,
          payrollExpensesCount: 0,
          taxableExpensesCount: 0
        },
        chartData: [],
        monthlyData: [],
        expenseCategoryData: [],
        entryCategoryData: [],
        allOperations: []
      };
    }

    const summary = calculateFinancialSummary(expenses, entries);
    const chartData = generateChartData(expenses, entries);
    const monthlyData = generateMonthlyData(expenses, entries);
    const expenseCategoryData = generateExpenseCategoryData(expenses);
    const entryCategoryData = generateEntryCategoryData(entries);
    const allOperations = formatAllOperations(expenses, entries);

    return {
      summary,
      chartData,
      monthlyData,
      expenseCategoryData,
      entryCategoryData,
      allOperations
    };
  }, [expenses, entries, isLoading]);

  return {
    ...processedData,
    rawData: {
      expenses,
      entries
    },
    isLoading,
    hasData: expenses.length > 0 || entries.length > 0
  };
};

// Hook para dados de gráficos específicos
export const useChartData = () => {
  const { chartData, monthlyData, expenseCategoryData, entryCategoryData, isLoading } = useProcessedFinancialData();

  return {
    dailyFlowData: chartData.map(item => ({ 
      name: item.name || 'N/A', 
      value: item.value || 0 
    })),
    monthlyComparisonData: monthlyData.map(item => ({ 
      name: item.name || 'N/A', 
      value: (item.entries || 0) - (item.expenses || 0)
    })),
    expenseTrendData: chartData.map(item => ({ 
      name: item.name || 'N/A', 
      value: item.expenses || 0 
    })),
    entryTrendData: chartData.map(item => ({ 
      name: item.name || 'N/A', 
      value: item.entries || 0 
    })),
    expenseCategoryData: expenseCategoryData.map(item => ({
      name: item.name || 'N/A',
      value: item.value || 0
    })),
    entryCategoryData: entryCategoryData.map(item => ({
      name: item.name || 'N/A',
      value: item.value || 0
    })),
    isLoading
  };
};

// Hook para estatísticas resumidas
export const useFinancialStats = () => {
  const { summary, rawData, isLoading } = useProcessedFinancialData();

  return {
    ...summary,
    counts: {
      totalExpenses: rawData.expenses.length,
      totalEntries: rawData.entries.length,
      totalOperations: rawData.expenses.length + rawData.entries.length
    },
    percentages: {
      payrollPercentage: summary.totalExpenses > 0 
        ? ((summary.payrollExpenses / summary.totalExpenses) * 100).toFixed(1)
        : "0",
      taxablePercentage: summary.totalExpenses > 0 
        ? ((summary.taxableExpenses / summary.totalExpenses) * 100).toFixed(1)
        : "0"
    },
    isLoading,
    hasData: summary.totalOperationsCount > 0
  };
};

// Hook para deletar despesas que funciona corretamente
export const useDeleteExpenseOperation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log("[useDeleteExpenseOperation] Attempting to delete expense with ID:", id);
      
      const response = await (client as any).api.expenses[id].$delete();
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Falha ao excluir despesa");
      }
      
      return response.json();
    },
    onSuccess: (data, id) => {
      console.log("[useDeleteExpenseOperation] Delete successful");
      toast.success("Despesa excluída com sucesso!");
      
      queryClient.removeQueries({ queryKey: ["expenses", id] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: (error) => {
      console.error("[useDeleteExpenseOperation] Failed to delete expense:", error);
      toast.error("Erro ao excluir despesa");
    },
  });
};

// Hook para deletar entradas que funciona corretamente
export const useDeleteEntryOperation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log("[useDeleteEntryOperation] Attempting to delete entry with ID:", id);
      
      const response = await (client as any).api.entries[id].$delete();
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Falha ao excluir entrada");
      }
      
      return response.json();
    },
    onSuccess: (data, id) => {
      console.log("[useDeleteEntryOperation] Delete successful");
      toast.success("Entrada excluída com sucesso!");
      
      queryClient.removeQueries({ queryKey: ["entries", id] });
      queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
    onError: (error) => {
      console.error("[useDeleteEntryOperation] Failed to delete entry:", error);
      toast.error("Erro ao excluir entrada");
    },
  });
};

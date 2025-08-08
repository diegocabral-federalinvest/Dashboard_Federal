import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { Investment, InvestmentCalculation, InvestmentFilters, DialogState, TabState } from "../_types";
import { 
  calculateInvestmentReturns, 
  generateChartData, 
  calculateInvestmentStats, 
  applyInvestmentFilters,
  validateInvestmentForm
} from "../_helpers";
import { DEFAULT_FILTERS } from "../_constants";
import { useDeleteInvestment } from "@/features/investments/api/use-delete-investment";
import { useUpdateInvestment } from "@/features/investments/api/use-update-investment";

/**
 * Hook para gerenciar os cálculos de investimentos
 */
export function useInvestmentCalculations(investments: Investment[]) {
  const calculations = useMemo(() => {
    return calculateInvestmentReturns(investments);
  }, [investments]);

  const chartData = useMemo(() => {
    return generateChartData(calculations);
  }, [calculations]);

  const stats = useMemo(() => {
    return calculateInvestmentStats(calculations);
  }, [calculations]);

  return {
    calculations,
    chartData,
    stats
  };
}

/**
 * Hook para gerenciar filtros de investimentos
 */
export function useInvestmentFilters(investments: Investment[]) {
  const [filters, setFilters] = useState<InvestmentFilters>(DEFAULT_FILTERS);

  const filteredInvestments = useMemo(() => {
    return applyInvestmentFilters(investments, filters);
  }, [investments, filters]);

  const { calculations: filteredCalculations, chartData: filteredChartData, stats: filteredStats } = 
    useInvestmentCalculations(filteredInvestments);

  const updateFilter = useCallback((key: keyof InvestmentFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      const defaultValue = DEFAULT_FILTERS[key as keyof InvestmentFilters];
      return value !== defaultValue;
    });
  }, [filters]);

  return {
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    filteredInvestments,
    filteredCalculations,
    filteredChartData,
    filteredStats
  };
}

/**
 * Hook para gerenciar estados dos diálogos
 */
export function useInvestmentDialogs() {
  const [dialogState, setDialogState] = useState<DialogState>({
    isNewInvestmentOpen: false,
    isInvestorRegistrationOpen: false,
    selectedInvestor: "",
    investmentAmount: "",
    selectedDate: undefined
  });

  const openNewInvestmentDialog = useCallback(() => {
    setDialogState(prev => ({
      ...prev,
      isNewInvestmentOpen: true,
      selectedDate: new Date() // Inicializar com hoje
    }));
  }, []);

  const closeNewInvestmentDialog = useCallback(() => {
    setDialogState(prev => ({
      ...prev,
      isNewInvestmentOpen: false,
      selectedInvestor: "",
      investmentAmount: "",
      selectedDate: undefined
    }));
  }, []);

  const openInvestorRegistrationDialog = useCallback(() => {
    setDialogState(prev => ({
      ...prev,
      isInvestorRegistrationOpen: true
    }));
  }, []);

  const closeInvestorRegistrationDialog = useCallback(() => {
    setDialogState(prev => ({
      ...prev,
      isInvestorRegistrationOpen: false
    }));
  }, []);

  const updateDialogField = useCallback((field: keyof DialogState, value: any) => {
    setDialogState(prev => ({ ...prev, [field]: value }));
  }, []);

  return {
    dialogState,
    openNewInvestmentDialog,
    closeNewInvestmentDialog,
    openInvestorRegistrationDialog,
    closeInvestorRegistrationDialog,
    updateDialogField
  };
}

/**
 * Hook para gerenciar abas ativas
 */
export function useInvestmentTabs() {
  const [tabState, setTabState] = useState<TabState>({
    activeTab: "overview"
  });

  const setActiveTab = useCallback((tab: TabState['activeTab']) => {
    setTabState({ activeTab: tab });
  }, []);

  return {
    activeTab: tabState.activeTab,
    setActiveTab
  };
}

/**
 * Hook para gerenciar ações de investimentos
 */
export function useInvestmentActions(onSuccess?: () => void) {
  const [currentEditId, setCurrentEditId] = useState<string | null>(null);
  const [currentDeleteId, setCurrentDeleteId] = useState<string | null>(null);
  
  // Hooks devem ser chamados no nível superior
  const updateMutation = useUpdateInvestment(currentEditId || undefined);
  const deleteMutation = useDeleteInvestment(currentDeleteId || undefined);

  const handleCreateInvestment = useCallback((
    data: {
      investorId: string;
      investorName: string;
      amount: string;
      date?: Date;
    },
    createMutation: any
  ) => {
    // Validar dados
    const validation = validateInvestmentForm({
      investorId: data.investorId,
      amount: data.amount,
      date: data.date
    });

    if (!validation.isValid) {
      validation.errors.forEach(error => {
        toast.error(error);
      });
      return;
    }

    const amount = parseFloat(data.amount);
    
    // Chamar mutation
    createMutation.mutate({
      investorId: data.investorId,
      investorName: data.investorName,
      value: amount,
      type: "aporte",
      date: data.date,
      startDate: data.date,
      status: "active",
      description: `Aporte de R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      returnRate: 1.2 // 1.2% ao dia
    }, {
      onSuccess: () => {
        toast.success("Investimento criado com sucesso!");
        onSuccess?.();
      },
      onError: (error: any) => {
        toast.error("Erro ao criar investimento: " + error.message);
      }
    });
  }, [onSuccess]);

  const handleEditInvestment = useCallback(async (id: string, data: Partial<Investment>) => {
    setCurrentEditId(id);
    
    try {
      await updateMutation.mutateAsync(data);
      toast.success("Investimento atualizado com sucesso!");
      onSuccess?.();
    } catch (error: any) {
      toast.error("Erro ao atualizar investimento: " + error.message);
      throw error;
    } finally {
      setCurrentEditId(null);
    }
  }, [updateMutation, onSuccess]);

  const handleDeleteInvestment = useCallback(async (id: string) => {
    setCurrentDeleteId(id);
    
    try {
      await deleteMutation.mutateAsync();
      toast.success("Investimento excluído com sucesso!");
      onSuccess?.();
    } catch (error: any) {
      toast.error("Erro ao excluir investimento: " + error.message);
      throw error;
    } finally {
      setCurrentDeleteId(null);
    }
  }, [deleteMutation, onSuccess]);

  const handleSendMessage = useCallback((investor: { email: string; phone: string }) => {
          // Message implementation pending
    toast.info("Funcionalidade de mensagem em desenvolvimento");
  }, []);

  return {
    handleCreateInvestment,
    handleEditInvestment,
    handleDeleteInvestment,
    handleSendMessage
  };
}

/**
 * Hook para performance e otimizações
 */
export function useInvestmentPerformance() {
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async (refetchFunctions: Array<() => Promise<any>>) => {
    setRefreshing(true);
    try {
      await Promise.all(refetchFunctions.map(fn => fn()));
      toast.success("Dados atualizados com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar dados");
    } finally {
      setRefreshing(false);
    }
  }, []);

  return {
    refreshing,
    refresh
  };
}

/**
 * Hook para animações e transições
 */
export function useInvestmentAnimations() {
  const [animationTrigger, setAnimationTrigger] = useState(0);

  const triggerAnimation = useCallback(() => {
    setAnimationTrigger(prev => prev + 1);
  }, []);

  const getStaggerDelay = useCallback((index: number, baseDelay: number = 0.1) => {
    return baseDelay * index;
  }, []);

  return {
    animationTrigger,
    triggerAnimation,
    getStaggerDelay
  };
}

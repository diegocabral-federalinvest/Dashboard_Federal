"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  RefreshCcw, 
  Users, 
  Filter,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useHeaderContent } from "@/hooks/use-header-content";
import { useGetInvestments } from "@/features/investments/api/use-get-investments";
import { useGetInvestors } from "@/features/investments/api/use-get-investors";
import { useCreateInvestment } from "@/features/investments/api/use-create-investment";

// Import modular components and utilities
import {
  EnhancedChart,
  EnhancedTable,
  StatsCards,

  InvestmentFilters,
  InvestorRegistrationModal
} from "./_components";
import {
  useInvestmentCalculations,
  useInvestmentFilters,
  useInvestmentDialogs,
  useInvestmentTabs,
  useInvestmentActions,
  useInvestmentPerformance,
  useInvestmentAnimations
} from "./_hooks";
import { Investment, Investor, InvestmentCalculation } from "./_types";
import { TABS_CONFIG, ANIMATION_VARIANTS } from "./_constants";
import { formatCurrency } from "@/lib/utils";


// Dialog Components
import NewInvestmentSheet from "../../../features/investments/components/new-investment-sheet";
import EditInvestmentSheet from "../../../features/investments/components/edit-investment-sheet";
import { useNewInvestment } from "../../../features/investments/hooks/use-new-investment";
import { useOpenInvestment } from "../../../features/investments/hooks/use-open-investment";
import { DeleteConfirmationDialog } from "./_components/delete-confirmation-dialog";

export default function InvestmentsClient() {
  // Set header content
  useHeaderContent({
    title: "Investimentos",
    subtitle: "Gestão avançada de investidores e rendimentos"
  });

  // Data fetching
  const { data: investmentsData = [], isLoading: isLoadingInvestments } = useGetInvestments();
  const { data: investorsData = [], isLoading: isLoadingInvestors, refetch: refetchInvestors } = useGetInvestors();
  const createInvestment = useCreateInvestment();

  // Custom hooks
  const { activeTab, setActiveTab } = useInvestmentTabs();
  const { 
    filters, 
    filteredInvestments, 
    filteredCalculations, 
    filteredChartData, 
    filteredStats,
    updateFilter,
    clearFilters,
    hasActiveFilters
  } = useInvestmentFilters(investmentsData as unknown as Investment[]);
  
  // Investment Sheet Hooks
  const { onOpen: openNewInvestment } = useNewInvestment();
  const { onOpen: openEditInvestment } = useOpenInvestment();
  
  const {
    dialogState,
    openInvestorRegistrationDialog,
    closeInvestorRegistrationDialog,
    updateDialogField
  } = useInvestmentDialogs();

  const { refreshing, refresh } = useInvestmentPerformance();
  const { triggerAnimation } = useInvestmentAnimations();

  const { handleCreateInvestment, handleEditInvestment, handleDeleteInvestment } = useInvestmentActions(() => {
    triggerAnimation();
  });



  // Estados simples para os dialogs de CRUD
  const [deletingInvestment, setDeletingInvestment] = useState<InvestmentCalculation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handlers simples para CRUD operations
  const handleEditClick = async (investmentId: string) => {
    openEditInvestment(investmentId);
  };

  const handleDeleteClick = async (investmentId: string) => {
    const calculation = filteredCalculations.find(calc => calc.id === investmentId);
    if (calculation) {
      setDeletingInvestment(calculation);
    }
  };



  const confirmDelete = async () => {
    if (!deletingInvestment) return;
    
    setIsDeleting(true);
    try {
      await handleDeleteInvestment(deletingInvestment.id);
      setDeletingInvestment(null);
      triggerAnimation();
    } catch (error) {
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  // Process investors data
  const investorsList: Investor[] = investorsData.map(investor => {
    const totalInvested = investmentsData
      .filter(inv => inv.investorId === investor.id && inv.status !== 'withdrawn')
      .reduce((sum, inv) => sum + Number(inv.value), 0);
    
    return {
      id: investor.id,
      name: investor.name,
      email: investor.email,
      phone: investor.phone || '',
      status: investor.status || 'pending',
      totalInvested,  
    };
  });

  // Função intermediária para criar investimento
  const handleSaveNewInvestment = useCallback(() => {
    const selectedInvestor = investorsList.find(inv => inv.id === dialogState.selectedInvestor);
    if (!selectedInvestor || !dialogState.investmentAmount || !dialogState.selectedDate) {
      return;
    }

    handleCreateInvestment({
      investorId: selectedInvestor.id,
      investorName: selectedInvestor.name,
      amount: dialogState.investmentAmount,
      date: dialogState.selectedDate
    }, createInvestment);
  }, [dialogState, investorsList, handleCreateInvestment, createInvestment]);

  const isLoading = isLoadingInvestments || isLoadingInvestors;

  // Handle refresh
  const handleRefresh = () => {
    refresh([refetchInvestors]);
  };

  // Handle form submission - this functionality is already handled by useInvestmentActions hook
  // The handleCreateInvestment from the hook is used directly in the NewInvestmentDialog component

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      <div className="container mx-auto p-4 md:p-6 pb-16 space-y-8">
        
        {/* Header Section with Actions */}
        <motion.div
          {...ANIMATION_VARIANTS.fadeIn}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Painel de Investimentos
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Acompanhe o crescimento dos seus investimentos com rendimento mensal de ~1.2%
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearFilters}
                className="border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300"
              >
                <X className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <RefreshCcw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            
            <Button 
              onClick={openInvestorRegistrationDialog}
              variant="outline"
              className="hover:text-white bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 dark:hover:bg-green-900/50"
            >
              <Users className="h-4 w-4 mr-2" />
              Novo Investidor
            </Button>
            
            <Button 
              onClick={openNewInvestment}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Investimento
            </Button>
          </div>
        </motion.div>

 

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "overview" | "contributions")}>
            <div className="flex justify-between items-center mb-6">
              <TabsList className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 p-1 rounded-xl shadow-lg">
                {TABS_CONFIG.map((tab) => (
                  <TabsTrigger 
                    key={tab.value} 
                    value={tab.value}
                    className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {filteredInvestments.length > 0 && (
                <Badge variant="outline" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  {filteredInvestments.length} investimento{filteredInvestments.length !== 1 ? 's' : ''} 
                  {hasActiveFilters && ' (filtrado)'}
                </Badge>
              )}
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
                <div className="xl:col-span-4">
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-xl">Evolução dos Investimentos</CardTitle>
                      <CardDescription>
                        Visualize as 3 métricas principais: <span className="font-medium text-green-600">Total Aportado</span>, 
                        <span className="font-medium text-amber-600"> Total de Rendimento</span> e 
                        <span className="font-medium text-blue-600"> Saldo Atual</span> (Aportado + Rendimento)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <EnhancedChart 
                        data={filteredChartData} 
                        investments={filteredInvestments as unknown as Investment[]}
                        investors={investorsList}
                        isLoading={isLoading}
                        height={400}
                        showSlider={true}
                        showLegend={true}
                      />
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
         

                  {/* Quick Summary
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50 border-0 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
                        Resumo Rápido
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-700 dark:text-blue-300">Total Geral:</span>
                        <span className="font-bold text-blue-900 dark:text-blue-100">
                          {formatCurrency(filteredStats.totalInvestment + filteredStats.totalReturns)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-700 dark:text-blue-300">ROI:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          +{filteredStats.returnPercentage.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-700 dark:text-blue-300">Rendimento Diário:</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          {formatCurrency((filteredStats.totalInvestment * 0.012))}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                */}
                </div>
              </div>
            </TabsContent>

            {/* Contributions Tab */}
            <TabsContent value="contributions" className="space-y-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl">Detalhamento de Aportes e Rendimentos</CardTitle>
                  <CardDescription>
                    Visualização completa dos cálculos de rendimento por investimento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EnhancedTable 
                    data={filteredCalculations}
                    isLoading={isLoading}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    pageSize={15}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            
          </Tabs>
        </motion.div>
      </div>

      {/* Dialogs */}
      <NewInvestmentSheet />
      <EditInvestmentSheet />

      <InvestorRegistrationModal
        open={dialogState.isInvestorRegistrationOpen}
        onOpenChange={closeInvestorRegistrationDialog}
        onSuccess={() => {
          refetchInvestors();
          closeInvestorRegistrationDialog();
        }}
      />

      <DeleteConfirmationDialog
        isOpen={!!deletingInvestment}
        onClose={() => setDeletingInvestment(null)}
        onConfirm={confirmDelete}
        investments={deletingInvestment ? [deletingInvestment] : []}
        isLoading={isDeleting}
        type="single"
      />
    </div>
  );
} 
"use client";

import React, { useMemo, useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDashboardFinancialData } from "@/hooks/use-financial-data";
import { useHeaderContent } from "@/hooks/use-header-content";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Download } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModernDashboardLayout } from "@/components/dashboard/modern-dashboard-layout";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { Button } from "@/components/ui/button";
import { handleExportDashboard } from "../_hooks";
import { RoleGuard } from "@/components/auth/role-guard";
import { useDebounce } from "@/hooks/use-debounce";

// Interface para controle de loading granular
interface LoadingState {
  isInitialLoading: boolean;
  isFilterLoading: boolean;
  isDataUpdating: boolean;
}

export default function DashboardClient() {
  // Usar o hook unificado para dados financeiros
  const {
    data,
    isLoading,
    isFetching,
    error,
    period,
    periodLabel,
    chartData,
    stats,
    investments,
    operational,
    setPeriodType,
    setYear,
    setMonth,
    setQuarter,
    hasInvestmentData,
    hasOperationalData
  } = useDashboardFinancialData({
    refetchInterval: 300000, // 5 minutes
    enableCache: true, // Habilitar cache para melhor performance
  });

  // Configurar header
  useHeaderContent({
    title: "Dashboard Financeiro",
    subtitle: periodLabel,
    pageType: 'dashboard',
    showDefaultActions: true
  });

  // Handlers otimizados para filtros - aplicação imediata
  const handlePeriodTypeChange = useCallback((value: string) => {
    setPeriodType(value as any);
  }, [setPeriodType]);

  const handleYearChange = useCallback((value: string) => {
    if (value === "all") {
      setYear(null as any); // null indica "todos os anos"
    } else {
      setYear(Number(value));
    }
  }, [setYear]);

  const handleMonthChange = useCallback((value: string) => {
    setMonth(Number(value));
  }, [setMonth]);

  const handleQuarterChange = useCallback((value: string) => {
    setQuarter(Number(value));
  }, [setQuarter]);

  // Função para valores seguros
  const safeNumber = useCallback((value: any, fallback: number = 0): number => {
    const num = Number(value);
    return !isNaN(num) ? num : fallback;
  }, []);

  // Preparar dados para os cards com valores seguros
  const safeStats = useMemo(() => {
    if (!stats) return {};
    
    const statKeys = [
      "netProfit", "netProfitPrevious", "netProfitGrowth", "projectedTaxes",
      "totalExpenses", "expensesPrevious", "expensesGrowth", "totalRevenues", "balance",
      "totalInvestments", "activeInvestors", "totalReturns", "totalContributions",
      "operationsTotal", "operationsPrevious", "operationsCount"
    ];

    return statKeys.reduce((acc, key) => {
      acc[key] = safeNumber(stats[key as keyof typeof stats]);
      return acc;
    }, {} as Record<string, number>);
  }, [stats, safeNumber]);

  // Loading inicial - tela completa
  if (isLoading && !data) {
    return <DashboardSkeleton />;
  }

  // Erro - tela de erro
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados do dashboard. Tente novamente em alguns instantes.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <RoleGuard allowedRoles={["ADMIN", "VIEWER", "EDITOR"]}>
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="relative space-y-6 p-4 md:p-6 pb-16 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 min-h-screen"
      >

     
        {/* Filtros de Período */}
        <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Tabs 
            value={period.periodType} 
            onValueChange={handlePeriodTypeChange}
          >
            <TabsList className="bg-gray-200 dark:bg-gray-800/50 backdrop-blur-sm">
              <TabsTrigger value="monthly">Mensal</TabsTrigger>
              <TabsTrigger value="quarterly">Trimestral</TabsTrigger>
              <TabsTrigger value="annual">Anual</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-2">
            {period.periodType === "monthly" && (
              <Select 
                value={period.month?.toString()} 
                onValueChange={handleMonthChange}
              >
                <SelectTrigger className="w-40 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
                    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"].map((month, index) => (
                    <SelectItem key={index} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {period.periodType === "quarterly" && (
              <Select 
                value={period.quarter?.toString()} 
                onValueChange={handleQuarterChange}
              >
                <SelectTrigger className="w-40 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["1º Trimestre", "2º Trimestre", "3º Trimestre", "4º Trimestre"].map((quarter, index) => (
                    <SelectItem key={index} value={(index + 1).toString()}>
                      {quarter}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select 
              value={period.year?.toString() || "all"} 
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="w-32 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Array.from({ length: 8 }, (_, i) => 2023 + i).map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/*}
          <div className="flex justify-between items-center mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportDashboard}
              className="gap-2"
              disabled={loadingState.isFilterLoading}
            >
              <Download className="h-4 w-4" />
              Exportar Dashboard
            </Button>
          </div>
          */}
        </motion.div>

        {/* Dashboard Layout com loading otimizado */}
        <ModernDashboardLayout 
          stats={safeStats as any}
          chartData={chartData}
          periodType={period.periodType}
          currentPeriod={period as any}
          isLoading={isFetching}
          hasData={!!data}
        />
      </motion.div>
    </RoleGuard>
  );
}

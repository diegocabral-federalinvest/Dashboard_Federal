"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useCallback } from "react";
import { useInvestmentReturn } from "@/features/investments/hooks/use-investment-return";
import { Investment } from "@/features/investments/api/use-get-investment";
import type { InvestorData, DashboardStats, ChartDataPoint } from "../_types";
import { generateChartData, generateTableData } from "../_utils/data-generators";
import { DASHBOARD_CONFIG } from "../constants";

interface UseInvestorDataReturn {
  // Data states
  investorData: InvestorData | undefined;
  investmentsData: Investment[];
  
  // Loading states
  isLoadingInvestor: boolean;
  isLoadingInvestments: boolean;
  
  // Processed data
  dashboardStats: DashboardStats;
  chartData: ChartDataPoint[];
  tableData: any[];
  
  // Error states
  error: string | null;
}

export function useInvestorData(): UseInvestorDataReturn {
  const { calculateReturn, getInvestmentStats } = useInvestmentReturn();

  // Check if user is linked to investor profile
  const { data: investorData, isLoading: isLoadingInvestor, error: investorError } = useQuery<InvestorData>({
    queryKey: ["investor-link"],
    queryFn: async () => {
      const response = await fetch("/api/investors/link-user");
      if (!response.ok) {
        const linkResponse = await fetch("/api/investors/link-user", {
          method: "POST",
        });
        if (!linkResponse.ok) {
          throw new Error("Failed to link investor");
        }
        return linkResponse.json();
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get investments for this investor
  const { 
    data: investmentsData = [], 
    isLoading: isLoadingInvestments,
    error: investmentsError 
  } = useQuery<Investment[]>({
    queryKey: ["investor-investments", investorData?.investor?.id],
    queryFn: async () => {
      if (!investorData?.investor?.id) return [];
      const response = await fetch(`/api/investments?investorId=${investorData.investor.id}`);
      if (!response.ok) throw new Error("Failed to fetch investments");
      return response.json();
    },
    enabled: !!investorData?.investor?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Memoize financial stats calculation
  const dashboardStats: DashboardStats = useMemo(() => {
    const investmentStats = getInvestmentStats(investmentsData);
    return {
      totalInvested: investmentStats.totalActivePrincipal,
      totalReturns: investmentStats.totalActiveEarned,
      currentBalance: investmentStats.totalValue,
      returnPercentage: investmentStats.percentageReturn,
      dailyReturnRate: investmentStats.averageDailyReturn,
    };
  }, [investmentsData, getInvestmentStats]);

  // Memoize chart data generation
  const chartData = useMemo(() => {
    if (!investmentsData || investmentsData.length === 0) return [];
    return generateChartData(investmentsData, DASHBOARD_CONFIG.CHART_DAYS);
  }, [investmentsData]);

  // Memoize table data generation using useCallback for the calculateReturn function
  const memoizedCalculateReturn = useCallback(calculateReturn, [calculateReturn]);
  
  const tableData = useMemo(() => {
    if (!investmentsData || investmentsData.length === 0) return [];
    return generateTableData(investmentsData, memoizedCalculateReturn);
  }, [investmentsData, memoizedCalculateReturn]);

  // Memoize error handling
  const error = useMemo(() => {
    return investorError?.message || investmentsError?.message || null;
  }, [investorError, investmentsError]);

  return useMemo(() => ({
    investorData,
    investmentsData: investmentsData || [],
    isLoadingInvestor,
    isLoadingInvestments,
    dashboardStats,
    chartData,
    tableData,
    error,
  }), [
    investorData,
    investmentsData,
    isLoadingInvestor,
    isLoadingInvestments,
    dashboardStats,
    chartData,
    tableData,
    error,
  ]);
} 
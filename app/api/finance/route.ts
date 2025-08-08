/**
 * Finance API Route
 * 
 * This module provides API endpoints for finance-related data.
 * It also exports types and functions for client-side usage.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { db } from "@/db/drizzle";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { 
  expenses, 
  entries,
  investors, 
  contributionsOrWithdrawals,
  userInvestorLinks 
} from "@/db/schema";
import logger from "@/lib/logger";
import { DashboardData, DashboardFilterParams } from "@/types/dashboard";

enum IsPosititiveOrNegative {
  POSITIVE = "positive",
  NEGATIVE = "negative",
}

// Server-side API route handler
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get filter parameters from query string
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "month";
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : new Date().getFullYear();
    const month = searchParams.get("month") ? parseInt(searchParams.get("month")!) : new Date().getMonth() + 1;
    const quarter = searchParams.get("quarter") ? parseInt(searchParams.get("quarter")!) : Math.ceil((new Date().getMonth() + 1) / 3);
    const isAnnual = searchParams.get("isAnnual") === "true";
    
    // Calculate date range based on period
    let startDate: Date;
    let endDate: Date;
    let previousStartDate: Date;
    let previousEndDate: Date;
    
    if (isAnnual) {
      // Annual period
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59);
      previousStartDate = new Date(year - 1, 0, 1);
      previousEndDate = new Date(year - 1, 11, 31, 23, 59, 59);
    } else if (searchParams.get("quarter")) {
      // Quarterly period
      const quarterStart = (quarter - 1) * 3;
      startDate = new Date(year, quarterStart, 1);
      endDate = new Date(year, quarterStart + 3, 0, 23, 59, 59);
      
      // Previous quarter
      const prevQuarter = quarter === 1 ? 4 : quarter - 1;
      const prevYear = quarter === 1 ? year - 1 : year;
      const prevQuarterStart = (prevQuarter - 1) * 3;
      previousStartDate = new Date(prevYear, prevQuarterStart, 1);
      previousEndDate = new Date(prevYear, prevQuarterStart + 3, 0, 23, 59, 59);
    } else if (searchParams.get("month")) {
      // Monthly period
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59);
      
      // Previous month
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      previousStartDate = new Date(prevYear, prevMonth - 1, 1);
      previousEndDate = new Date(prevYear, prevMonth, 0, 23, 59, 59);
    } else {
      // Default to current month
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      
      const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      previousStartDate = new Date(prevYear, prevMonth, 1);
      previousEndDate = new Date(prevYear, prevMonth + 1, 0, 23, 59, 59);
    }
    
    // Fetch all data in parallel for both current and previous periods
    const [
      revenuesData,
      expensesData,
      previousRevenuesData,
      previousExpensesData,
      investorsData,
      contributionsData,
      allTimeContributionsData,
    ] = await Promise.all([
      // Current period revenues
      db.select()
        .from(entries)
        .where(
          and(
            gte(entries.date, startDate),
            lte(entries.date, endDate)
          )
        )
        .orderBy(desc(entries.date)),
      
      // Current period expenses
      db.select()
        .from(expenses)
        .where(
          and(
            gte(expenses.date, startDate),
            lte(expenses.date, endDate)
          )
        )
        .orderBy(desc(expenses.date)),
      
      // Previous period revenues
      db.select()
        .from(entries)
        .where(
          and(
            gte(entries.date, previousStartDate),
            lte(entries.date, previousEndDate)
          )
        )
        .orderBy(desc(entries.date)),
      
      // Previous period expenses
      db.select()
        .from(expenses)
        .where(
          and(
            gte(expenses.date, previousStartDate),
            lte(expenses.date, previousEndDate)
          )
        )
        .orderBy(desc(expenses.date)),
      
      // All investors
      db.select()
        .from(investors)
        .orderBy(desc(investors.createdAt)),
      
      // Current period contributions
      db.select({
        id: contributionsOrWithdrawals.id,
        amount: contributionsOrWithdrawals.amount,
        date: contributionsOrWithdrawals.date,
        investorId: contributionsOrWithdrawals.investorId,
        investorName: investors.name,
      })
        .from(contributionsOrWithdrawals)
        .leftJoin(investors, eq(contributionsOrWithdrawals.investorId, investors.id))
        .where(
          and(
            gte(contributionsOrWithdrawals.date, startDate),
            lte(contributionsOrWithdrawals.date, endDate)
          )
        )
        .orderBy(desc(contributionsOrWithdrawals.date)),
      
      // All time contributions for total calculations
      db.select({
        amount: contributionsOrWithdrawals.amount,
        investorId: contributionsOrWithdrawals.investorId,
      })
        .from(contributionsOrWithdrawals),
    ]);
    
    // Calculate totals for current period
    const totalRevenues = revenuesData.reduce((sum, revenue) => sum + Number(revenue.value), 0);
    const totalExpenses = expensesData.reduce((sum, expense) => sum + Number(expense.value), 0);
    const netProfit = totalRevenues - totalExpenses;
    
    // Calculate totals for previous period
    const previousTotalRevenues = previousRevenuesData.reduce((sum, revenue) => sum + Number(revenue.value), 0);
    const previousTotalExpenses = previousExpensesData.reduce((sum, expense) => sum + Number(expense.value), 0);
    const previousNetProfit = previousTotalRevenues - previousTotalExpenses;
    
    // Calculate growth percentages
    const netProfitGrowth = previousNetProfit !== 0 
      ? ((netProfit - previousNetProfit) / Math.abs(previousNetProfit)) * 100 
      : 0;
    
    const expensesGrowth = previousTotalExpenses !== 0
      ? ((totalExpenses - previousTotalExpenses) / Math.abs(previousTotalExpenses)) * 100
      : 0;
    
    // Calculate tax projection (15% IRPJ + 9% CSLL for quarterly)
    const projectedTaxes = isAnnual || searchParams.get("quarter") 
      ? Math.max(0, netProfit * 0.24) // 24% total tax for profitable quarters
      : 0;
    
    // Calculate investment data
    const totalInvestments = allTimeContributionsData.reduce((sum, contribution) => 
      sum + Number(contribution.amount), 0);
    const activeInvestors = investorsData.length;
    const totalContributions = contributionsData.length;
    
    // Calculate returns (simplified - in real app would need actual portfolio values)
    const totalReturns = totalInvestments * 0.15; // Mock 15% return
    
    // Calculate operations data
    const operationsTotal = totalRevenues + totalExpenses; // Sum of all financial operations
    const operationsPrevious = previousTotalRevenues + previousTotalExpenses;
    const operationsCount = revenuesData.length + expensesData.length;
    
    // Build response with real data
    const dashboardData: DashboardData = {
      summary: {
        grossRevenue: totalRevenues,
        netRevenue: totalRevenues * 0.85, // Assuming 15% deductions
        taxableExpenses: totalExpenses * 0.7,
        nonTaxableExpenses: totalExpenses * 0.3,
        grossProfit: totalRevenues - totalExpenses,
        netProfit: netProfit,
      },
      // Chart data for visualizations
      chartData: [
        {
          period: isAnnual ? `Ano ${year}` : `${year}-${month?.toString().padStart(2, '0') || quarter}`,
          receitas: totalRevenues,
          despesas: totalExpenses,
          lucro: netProfit,
        }
      ],
      stats: {
        // Card 1: Resultado Líquido
        netProfit: netProfit,
        netProfitPrevious: previousNetProfit,
        netProfitGrowth: netProfitGrowth,
        projectedTaxes: projectedTaxes,
        netProfitChange: `${netProfitGrowth >= 0 ? '+' : ''}${netProfitGrowth.toFixed(2)}%`,
        netProfitChangeType: netProfitGrowth >= 0 ? IsPosititiveOrNegative.POSITIVE : IsPosititiveOrNegative.NEGATIVE,
        lastQuarter: previousNetProfit,
        growthRate: netProfitGrowth,
        taxProjection: projectedTaxes,
        
        // Card 2: Despesas & Entradas
        totalExpenses: totalExpenses,
        expensesPrevious: previousTotalExpenses,
        expensesGrowth: expensesGrowth,
        totalRevenues: totalRevenues,
        balance: totalRevenues - totalExpenses,
        
        // Card 3: Investimentos
        totalInvestments: totalInvestments,
        activeInvestors: activeInvestors,
        totalReturns: totalReturns,
        totalContributions: totalContributions,
        
        // Card 4: Operações
        operationsTotal: operationsTotal,
        operationsPrevious: operationsPrevious,
        operationsCount: operationsCount,
        totalOperations: operationsTotal,
        lastMonthOps: operationsPrevious,
        totalOperationsCount: operationsCount,
        
        // Dados legados (manter compatibilidade)
        grossRevenue: totalRevenues,
        grossRevenueChange: "0%",
        grossRevenueChangeType: IsPosititiveOrNegative.POSITIVE,
        netRevenue: totalRevenues * 0.85,
        netRevenueChange: "0%",
        netRevenueChangeType: IsPosititiveOrNegative.POSITIVE,
        grossProfit: totalRevenues - totalExpenses,
        grossProfitChange: "0%",
        grossProfitChangeType: totalRevenues - totalExpenses >= 0 ? IsPosititiveOrNegative.POSITIVE : IsPosititiveOrNegative.NEGATIVE,
      },
      charts: {
        revenue: [],
        expenses: [],
        profit: [],
        evolution: [],
        distribution: [],
        comparison: [],
        projections: [],
      },
      indicators: {
        grossMargin: totalRevenues > 0 ? ((totalRevenues - totalExpenses) / totalRevenues) * 100 : 0,
        netMargin: totalRevenues > 0 ? (netProfit / totalRevenues) * 100 : 0,
        yoyGrowth: 0,
        efficiencyRatio: 0,
      },
      operations: {
        recent: [],
        pending: [],
      },
      tables: {
        recentTransactions: [
          ...revenuesData.slice(0, 5).map(revenue => ({
            id: revenue.id,
            description: revenue.description,
            amount: Number(revenue.value),
            date: revenue.date.toISOString(),
            type: "income" as const,
            category: 'Receita',
          })),
          ...expensesData.slice(0, 5).map(expense => ({
            id: expense.id,
            description: expense.description,
            amount: Number(expense.value),
            date: expense.date.toISOString(),
            type: "expense" as const,
            category: 'Despesa',
          })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10),
        
        activeInvestors: investorsData.length > 0 ? investorsData.map(inv => ({
          id: inv.id,
          name: inv.name,
          totalInvested: 0,
          currentValue: 0,
          returns: 0,
          lastActivity: inv.createdAt.toISOString(),
        })) : [],
        
        expensesByCategory: [],
      },
    };
    
    logger.info("Dashboard data fetched successfully", {
      source: "backend",
      context: "api:finance",
      data: { 
        period,
        year,
        month,
        quarter,
        isAnnual,
        totalRevenues,
        totalExpenses,
        activeInvestors,
        transactionsCount: revenuesData.length + expensesData.length
      }
    });
    
    return NextResponse.json(dashboardData);
  } catch (error) {
    logger.error("Error in finance API", {
      source: "backend",
      context: "api:finance",
      data: { error: error instanceof Error ? error.message : String(error) }
    });
    
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 
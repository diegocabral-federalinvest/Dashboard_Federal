"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Calendar,
  Filter,
  Wallet,
  Building,
  LineChart,
  Download,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { EnhancedFinancialChart } from "@/components/charts/enhanced-financial-chart";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Componente de skeleton inline para valores individuais
function InlineValueSkeleton({ width = "w-20" }: { width?: string }) {
  return (
    <div className="inline-flex items-center">
      <Skeleton className={`h-4 ${width} animate-pulse`} />
      <Loader2 className="h-3 w-3 ml-2 animate-spin text-blue-500" />
    </div>
  );
}

// Componente de skeleton para valores principais (maiores)
function MainValueSkeleton({ width = "w-28" }: { width?: string }) {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className={`h-8 ${width} animate-pulse`} />
      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
    </div>
  );
}

// Componente de badge neon para crescimento
function GrowthBadge({ 
  value, 
  prefix = "" 
}: { 
  value: number; 
  prefix?: string; 
}) {
  // Garantir que value seja um número válido
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
  
  let badgeColor = "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600";
  
  if (safeValue > 0) {
    badgeColor = "bg-green-100 dark:bg-green-900/30 text-emerald-700 dark:text-emerald-400 border-green-300 dark:border-green-600 shadow-green-500/20 shadow-sm";
  } else if (safeValue < 0) {
    badgeColor = "bg-red-100 dark:bg-red-900/30 text-rose-700 dark:text-rose-400 border-red-300 dark:border-red-600 shadow-red-500/20 shadow-sm";
  }
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "text-xs font-medium px-2 py-0.5 rounded-full border",
        badgeColor
      )}
    >
      {prefix}{safeValue >= 0 ? '+' : ''}{safeValue.toFixed(2)}%
    </Badge>
  );
}

// Componente de ícone neon melhorado
function NeonIcon({ 
  icon: Icon, 
  className = "" 
}: { 
  icon: React.ElementType; 
  className?: string; 
}) {
  return (
    <div className={cn(
      "p-2 rounded-full relative",
      "bg-blue-50/80 dark:bg-blue-900/30",
      "border border-blue-200/50 dark:border-blue-600/30",
      "shadow-blue-500/20 shadow-sm",
      "backdrop-blur-sm",
      className
    )}>
      <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400 drop-shadow-sm" />
      <div className="absolute inset-0 rounded-full bg-blue-500/10 dark:bg-blue-400/10 blur-sm" />
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  description?: string;
  className?: string;
}

function MetricCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon, 
  description,
  className 
}: MetricCardProps) {
  const changeColor = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  };

  const changeBg = {
    positive: 'bg-green-50 border-green-200',
    negative: 'bg-red-50 border-red-200',
    neutral: 'bg-gray-50 border-gray-200'
  };

  const ChangeIcon = changeType === 'positive' ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-2xl font-bold text-gray-900">
            {value}
          </div>
          <div className="flex items-center space-x-2">
            <div className={cn(
              "flex items-center space-x-1 px-2 py-1 rounded-full border text-xs font-medium",
              changeBg[changeType]
            )}>
              <ChangeIcon className={cn("h-3 w-3", changeColor[changeType])} />
              <span className={changeColor[changeType]}>{change}</span>
            </div>
            {description && (
              <span className="text-xs text-gray-500">{description}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface QuickStatsProps {
  title: string;
  value: string;
  subtitle: string;
  trend: 'up' | 'down' | 'stable';
  color: 'blue' | 'green' | 'red' | 'purple';
}

function QuickStats({ title, value, subtitle, trend, color }: QuickStatsProps) {
  const colorClasses = {
    blue: 'bg-blue-500 text-white',
    green: 'bg-green-500 text-white',
    red: 'bg-red-500 text-white',
    purple: 'bg-purple-500 text-white'
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Activity;

  return (
    <div className={cn(
      "rounded-lg p-4 text-white relative overflow-hidden",
      colorClasses[color]
    )}>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium opacity-90">{title}</h3>
          <TrendIcon className="h-4 w-4 opacity-75" />
        </div>
        <div className="text-2xl font-bold mb-1">{value}</div>
        <div className="text-xs opacity-75">{subtitle}</div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
    </div>
  );
}

interface ModernDashboardLayoutProps {
  stats: {
    netProfit: number;
    netProfitPrevious: number;
    netProfitGrowth: number;
    projectedTaxes: number;
    totalExpenses: number;
    expensesPrevious: number;
    expensesGrowth: number;
    totalRevenues: number;
    balance: number;
    totalInvestments: number;
    activeInvestors: number;
    totalReturns: number;
    totalContributions: number;
    operationsTotal: number;
    operationsPrevious: number;
    operationsCount: number;
  };
  chartData: any[];
  periodType: "monthly" | "quarterly" | "annual";
  currentPeriod: {
    year: number | null; // Permitir null para "todos os anos"
    month?: number;
    quarter?: number;
    periodType: "monthly" | "quarterly" | "annual";
  };
  isLoading?: boolean;
  hasData?: boolean; // Novo: indicar se há dados para melhor UX
}

export function ModernDashboardLayout({ 
  stats, 
  chartData, 
  periodType, 
  currentPeriod,
  isLoading = false,
  hasData = true
}: ModernDashboardLayoutProps) {
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const getPeriodLabel = () => {
    switch (periodType) {
      case "monthly":
        return "Mês";
      case "quarterly":
        return "Trimestre";
      case "annual":
        return "Ano";
      default:
        return "Período";
    }
  };



  return (
    <div data-dashboard-content>
      {/* Cards Grid - Layout mais compacto */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1 - Resultado Líquido */}
        <motion.div variants={item}>
          <GlassCard 
            variant="light" 
            elevation="medium"
            className="h-full"
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <Badge variant="secondary" className="px-2 py-1 text-lg  text-blue-500 font-semibold bg-blue-500/10 dark:bg-blue-900/30 
                border border-blue-200/50 dark:border-blue-600/30 shadow-blue-500/20 shadow-sm backdrop-blur-sm">
                  Resultado Líquido
                </Badge>
                <NeonIcon icon={TrendingUp} />
              </div>
              
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                {isLoading ? (
                  <MainValueSkeleton width="w-32" />
                ) : (
                  formatCurrency(stats.netProfit)
                )}
              </div>
              
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Último {getPeriodLabel()}:
                  </span>
                  <span className="font-medium">
                    {isLoading ? (
                      <InlineValueSkeleton width="w-16" />
                    ) : (
                      formatCurrency(stats.netProfitPrevious)
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Crescimento:</span>
                  <span className="font-medium">
                    {isLoading ? (
                      <InlineValueSkeleton width="w-12" />
                    ) : (
                      <GrowthBadge value={stats.netProfitGrowth} />
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Projeção Impostos:</span>
                  <span className="font-medium">
                    {isLoading ? (
                      <InlineValueSkeleton width="w-16" />
                    ) : (
                      formatCurrency(stats.projectedTaxes)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Card 2 - Investimentos */}
        <motion.div variants={item}>
          <GlassCard 
            variant="light" 
            elevation="medium"
            className="h-full border-l border-gray-200"
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
              <Badge variant="secondary" className="px-2 py-1 text-lg text-white text-blue-500 font-semibold bg-blue-500/10 dark:bg-blue-900/30 
                border border-blue-200/50 dark:border-blue-600/30 shadow-blue-500/20 shadow-sm backdrop-blur-sm">
                  Investimentos
                </Badge>
                <NeonIcon icon={Building} />
              </div>
              
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                {isLoading ? (
                  <MainValueSkeleton width="w-32" />
                ) : (
                  formatCurrency(stats.totalInvestments)
                )}
              </div>
              
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Investidores:</span>
                  <span className="font-medium">
                    {isLoading ? (
                      <InlineValueSkeleton width="w-8" />
                    ) : (
                      stats.activeInvestors
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Retornos:</span>
                  <span className="font-medium">
                    {isLoading ? (
                      <InlineValueSkeleton width="w-16" />
                    ) : (
                      formatCurrency(stats.totalReturns)
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Aportes:</span>
                  <span className="font-medium">
                    {isLoading ? (
                      <InlineValueSkeleton width="w-12" />
                    ) : (
                      stats.totalContributions
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Crescimento:</span>
                  <span className="font-medium">
                    {isLoading ? (
                      <InlineValueSkeleton width="w-12" />
                    ) : (
                      <GrowthBadge value={
                        stats.totalInvestments > 0 
                          ? ((stats.totalReturns / stats.totalInvestments) * 100) 
                          : 0
                      } />
                    )}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Card 3 - Operações Convencionais */}
        <motion.div variants={item}>
          <GlassCard 
            variant="light" 
            elevation="medium"
            className="h-full border-l border-gray-200"
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
              <Badge variant="secondary" className="px-2 py-1 text-lg text-white text-blue-500 font-semibold bg-blue-500/10 dark:bg-blue-900/30 
                border border-blue-200/50 dark:border-blue-600/30 shadow-blue-500/20 shadow-sm backdrop-blur-sm">
                  Operações Convencionais
                </Badge>
                <NeonIcon icon={LineChart} />
              </div>
              
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                {isLoading ? (
                  <MainValueSkeleton width="w-32" />
                ) : (
                  formatCurrency(stats.operationsTotal)
                )}
              </div>
              
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Último {getPeriodLabel()}:
                  </span>
                  <span className="font-medium">
                    {isLoading ? (
                      <InlineValueSkeleton width="w-16" />
                    ) : (
                      formatCurrency(stats.operationsPrevious)
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Crescimento:</span>
                  <span className="font-medium">
                    {isLoading ? (
                      <InlineValueSkeleton width="w-12" />
                    ) : (
                      <GrowthBadge value={
                        stats.operationsPrevious > 0 
                          ? ((stats.operationsTotal - stats.operationsPrevious) / stats.operationsPrevious) * 100 
                          : 0
                      } />
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total Operações:</span>
                  <span className="font-medium">
                    {isLoading ? (
                      <InlineValueSkeleton width="w-8" />
                    ) : (
                      stats.operationsCount
                    )}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Card 4 - Operações Trustee */}
        <motion.div variants={item}>
          <GlassCard 
            variant="light" 
            elevation="medium"
            className="h-full border-l border-gray-200"
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
              <Badge variant="secondary" className="px-2 py-1 text-lg text-white text-blue-500 font-semibold bg-blue-500/10 dark:bg-blue-900/30 
                border border-blue-200/50 dark:border-blue-600/30 shadow-blue-500/20 shadow-sm backdrop-blur-sm">
                  Operações Trustee
                </Badge>
                <NeonIcon icon={Wallet} />
              </div>
              
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                {isLoading ? (
                  <MainValueSkeleton width="w-32" />
                ) : (
                  formatCurrency(0)
                )}
              </div>
              
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Último {getPeriodLabel()}:
                  </span>
                  <span className="font-medium">
                    {isLoading ? (
                      <InlineValueSkeleton width="w-16" />
                    ) : (
                      formatCurrency(0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Crescimento:</span>
                  <span className="font-medium">
                    {isLoading ? (
                      <InlineValueSkeleton width="w-12" />
                    ) : (
                      <GrowthBadge value={0} />
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total Operações:</span>
                  <span className="font-medium">
                    {isLoading ? (
                      <InlineValueSkeleton width="w-8" />
                    ) : (
                      0
                    )}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Gráfico com loading state */}
      <motion.div variants={item} className="mt-4">
        <GlassCard 
          variant="light" 
          elevation="medium"
          className="min-h-[500px] relative"
        >
          <div className="p-2">
            {isLoading ? (
              <div className="h-[460px] flex flex-col items-center justify-center space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  <span className="text-lg font-medium text-gray-600">Carregando gráfico...</span>
                </div>
                
                {/* Skeleton do gráfico */}
                <div className="w-full space-y-4">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 mb-6">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                  
                  <div className="relative">
                    <Skeleton className="h-80 w-full" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex items-center gap-2 text-gray-500">
                        <LineChart className="h-5 w-5" />
                        <span className="text-sm">Preparando visualização</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <EnhancedFinancialChart 
                data={chartData} 
                periodType={periodType}
                currentPeriod={{
                  ...currentPeriod,
                  year: currentPeriod.year || new Date().getFullYear() // Fallback para ano atual se null
                }}
                showMetricsSummary={false}
                enableAllVariables={true}
                title="Evolução Financeira Completa"
              />
            )}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
} 
//src/app/investidor/dashboard/[id]/client.tsx
"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdvancedDataTable, TableColumn } from "@/components/ui/advanced-data-table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Calendar, Activity, TrendingUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GlassCard } from "@/components/ui/glass-card";

// Hooks e Utils
import { useInvestorData } from "./_hooks/use-investor-data";
import { generateInvestmentTableData, generateChartDataByPeriod } from "./_utils/data-generators";
import { formatCurrencyHighPrecision } from "@/features/investments/components/investments-columns";
import { useRealtimeReturns } from "./_hooks/use-realtime-returns";
import { use24HProgress } from "./_hooks/use-24h-progress";

// Constantes e Tipos
import { TABLE_COLUMNS } from "./constants";
import type { DateRange } from "react-day-picker";

interface InvestorDashboardProps {
  investorId: string;
}

type PeriodFilter = "today" | "week" | "month" | "3months" | "6months" | "year";

const PERIOD_OPTIONS = [
  { value: "today" as PeriodFilter, label: "Hoje" },
  { value: "week" as PeriodFilter, label: "7 dias" },
  { value: "month" as PeriodFilter, label: "30 dias" },
  { value: "3months" as PeriodFilter, label: "3 meses" },
  { value: "6months" as PeriodFilter, label: "6 meses" },
  { value: "year" as PeriodFilter, label: "1 ano" },
];

export default function InvestorDashboard({ investorId }: InvestorDashboardProps) {
  
  // Estados para filtros e controles
  const [activePeriod, setActivePeriod] = useState<PeriodFilter>("month");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  
  // Dados principais
  const {
    dashboardStats,
    isLoadingInvestor,
    isLoadingInvestments,
    error
  } = useInvestorData();

  const {
    currentBalance: totalBalance,
    totalInvested,
    totalReturns: currentReturn,
    returnPercentage,
  } = dashboardStats;

  // Hooks para tempo real
  const { currentReturn: realtimeReturn, returnVelocity } = useRealtimeReturns({
    totalBalance,
    dailyReturnRate: 0.04, // 1.2% ao mês ≈ 0.04% ao dia
  });

  const { progressPercentage } = use24HProgress();

  // Dados da tabela memoizados
  const tableData = useMemo(() => 
    generateInvestmentTableData(100), 
    []
  );

  // Colunas memoizadas 
  const memoizedColumns = useMemo(() => TABLE_COLUMNS, []);

  // Dados do gráfico filtrados por período com duas variáveis
  const chartData = useMemo(() => {
    const baseData = generateChartDataByPeriod(activePeriod, dateRange);
    
    // Se tempo real estiver ativo, adicionar ponto atual
    if (isRealTimeEnabled && baseData.length > 0) {
      const now = new Date();
      const realtimeBalance = totalBalance + (realtimeReturn || 0);
      const currentPoint = {
        date: activePeriod === "today" 
          ? now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          : now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        currentBalance: realtimeBalance,
        totalInvested: totalInvested,
        returns: realtimeReturn || 0,
        time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      
      return [...baseData, currentPoint];
    }
    
    return baseData;
  }, [activePeriod, dateRange, isRealTimeEnabled, totalBalance, totalInvested, realtimeReturn]);

  // Cálculos financeiros
  const realtimeBalance = totalBalance + (realtimeReturn || 0);
  const totalReturns = realtimeBalance - totalInvested;
  const totalReturnPercentage = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;
  const todayReturn = realtimeReturn || 0;

  // Loading state
  if (isLoadingInvestor || isLoadingInvestments) {
    return (
      <div className="w-full space-y-6 animate-pulse">
        <div className="grid grid-cols-3 gap-6">
          <div className="h-96 bg-slate-800/30 rounded-lg" />
          <div className="col-span-2 h-96 bg-slate-800/30 rounded-lg" />
        </div>
        <div className="h-64 bg-slate-800/30 rounded-lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full text-center py-10">
        <p className="text-red-400">Erro ao carregar dados do investidor</p>
      </div>
    );
  }

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full space-y-6 p-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 min-h-screen"
    >
      
      {/* Seletor de Período e Status */}
      <motion.div variants={item}>
        <GlassCard 
          variant="light" 
          elevation="medium"
          className="p-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            
            {/* Seletor de Período */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Período:</span>
              <Select value={activePeriod} onValueChange={(value: PeriodFilter) => setActivePeriod(value)}>
                <SelectTrigger className="w-[180px] bg-white/80 dark:bg-gray-800/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIOD_OPTIONS.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      className="text-gray-900 dark:text-gray-100"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Indicadores de Status */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300">
                    Ativo
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Última atualização</p>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300">
                    Agora mesmo
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Área Principal - Layout 1/3 + 2/3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna Esquerda: Saldo Total (1/3) */}
        <motion.div variants={item} className="lg:col-span-1">
          <GlassCard 
            variant="light" 
            elevation="medium"
            className="h-full"
          >
            <div className="p-6 space-y-6">
              {/* Header com título e badge de variação */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Saldo Total
                </h3>
                <Badge 
                  variant="outline" 
                  className={returnPercentage >= 0 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300" 
                    : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300"
                  }
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {returnPercentage >= 0 ? '+' : ''}{returnPercentage.toFixed(3)}%
                </Badge>
              </div>
              
              {/* Valor Principal */}
              <div className="space-y-2">
                <motion.p 
                  key={realtimeBalance}
                  initial={{ scale: 1.02 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-3xl font-bold text-gray-900 dark:text-gray-100 font-mono"
                >
                  {formatCurrencyHighPrecision(realtimeBalance)}
                </motion.p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Valor total atual • Atualização em tempo real
                </p>
              </div>
              
              {/* Grid de Métricas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Total Investido
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(totalInvested)}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Total Ganho
                  </p>
                  <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(totalReturns)}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Rendimento Total
                  </p>
                  <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    +{totalReturnPercentage.toFixed(2)}%
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Hoje
                  </p>
                  <p className="text-lg font-semibold text-amber-600 dark:text-amber-400 font-mono">
                    +{formatCurrencyHighPrecision(todayReturn)}
                  </p>
                </div>
              </div>

              {/* Progresso do Dia */}
              <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Progresso do Dia
                    </span>
                  </div>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300">
                    +{progressPercentage.toFixed(4)}%/dia
                  </Badge>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
                  />
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400 font-mono text-center">
                  R$ {formatCurrencyHighPrecision(returnVelocity || 0).replace('R$ ', '')}/s
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Coluna Direita: Gráfico de Evolução (2/3) */}
        <motion.div variants={item} className="lg:col-span-2">
          <GlassCard 
            variant="light" 
            elevation="medium"
            className="h-full"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Evolução do Investimento
                </h3>
                {isRealTimeEnabled && (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
                    Tempo Real
                  </Badge>
                )}
              </div>
              
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="#e5e7eb"
                      opacity={0.5}
                    />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        color: '#111827',
                        fontSize: '12px'
                      }}
                      formatter={(value: any, name: string) => [
                        formatCurrency(value), 
                        name === 'currentBalance' ? 'Saldo Atual' : 'Total Investido'
                      ]}
                      labelFormatter={(label) => `Data: ${label}`}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '12px' }}
                      iconType="line"
                    />
                    
                    {/* Linha do Total Investido */}
                    <Line 
                      type="monotone" 
                      dataKey="totalInvested" 
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Total Investido"
                      dot={{ 
                        fill: '#3b82f6', 
                        strokeWidth: 2, 
                        r: 3 
                      }}
                      activeDot={{ 
                        r: 5, 
                        stroke: '#3b82f6', 
                        strokeWidth: 2, 
                        fill: '#fff' 
                      }}
                    />
                    
                    {/* Linha do Saldo Atual */}
                    <Line 
                      type="monotone" 
                      dataKey="currentBalance" 
                      stroke="#10b981"
                      strokeWidth={3}
                      name="Saldo Atual"
                      dot={{ 
                        fill: '#10b981', 
                        strokeWidth: 2, 
                        r: 4 
                      }}
                      activeDot={{ 
                        r: 6, 
                        stroke: '#10b981', 
                        strokeWidth: 2, 
                        fill: '#fff' 
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Seção Inferior: Histórico de Investimentos */}
      <motion.div variants={item}>
        <GlassCard 
          variant="light" 
          elevation="medium"
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Histórico de Investimentos
            </h3>
            <AdvancedDataTable
              columns={memoizedColumns as unknown as TableColumn[]}
              data={tableData}
              title=""
              totalRecords={tableData.length}
              className="[&_table]:bg-transparent [&_thead]:bg-gray-50 dark:[&_thead]:bg-gray-800/50 [&_tbody_tr]:border-gray-200 dark:[&_tbody_tr]:border-gray-700 [&_tbody_tr:hover]:bg-gray-50 dark:[&_tbody_tr:hover]:bg-gray-800/30"
            />
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

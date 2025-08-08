"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, Percent, Clock, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyHighPrecision } from "@/features/investments/components/investments-columns";
import { formatCurrency } from "@/lib/utils";
import { useRealtimeReturns } from "../_hooks/use-realtime-returns";
import { use24HProgress } from "../_hooks/use-24h-progress";

interface RealtimeStatsProps {
  totalBalance: number;
  totalInvested: number;
  currentReturn: number;
}

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
  subtitle?: string;
  isRealtime?: boolean;
  delay?: number;
}

const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon, 
  subtitle,
  isRealtime = false,
  delay = 0 
}: StatCardProps) => {
  const getChangeColor = () => {
    switch (changeType) {
      case "positive": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      case "negative": return "text-red-400 bg-red-500/10 border-red-500/30";
      default: return "text-blue-400 bg-blue-500/10 border-blue-500/30";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className="relative"
    >
      <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 dark:from-blue-950/40 dark:to-blue-900/30 border-blue-700/30 dark:border-blue-600/20 backdrop-blur-lg hover:scale-105 transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
                {icon}
              </div>
              <div>
                <p className="text-sm text-blue-200/70 dark:text-blue-300/70 font-medium">
                  {title}
                </p>
                {subtitle && (
                  <p className="text-xs text-blue-200/50 dark:text-blue-300/50">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            
            {isRealtime && (
              <Badge 
                variant="outline" 
                className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30 animate-pulse"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                Live
              </Badge>
            )}
          </div>
          
          <motion.div
            key={value}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-2xl font-bold text-white font-mono mb-2">
              {value}
            </p>
          </motion.div>
          
          {change && (
            <Badge 
              variant="outline" 
              className={`${getChangeColor()} text-xs font-medium`}
            >
              {changeType === "positive" && <TrendingUp className="w-3 h-3 mr-1" />}
              {changeType === "negative" && <TrendingDown className="w-3 h-3 mr-1" />}
              {change}
            </Badge>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function RealtimeStats({
  totalBalance,
  totalInvested,
  currentReturn,
}: RealtimeStatsProps) {
  
  // Hooks para tempo real
  const { currentReturn: realtimeReturn, returnVelocity } = useRealtimeReturns({
    totalBalance,
    dailyReturnRate: 0.04, // 1.2% ao mês ≈ 0.04% ao dia
  });

  const { progressPercentage } = use24HProgress();

  // Cálculos
  const realtimeBalance = totalBalance + (realtimeReturn || 0);
  const totalReturns = realtimeBalance - totalInvested;
  const totalReturnPercentage = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;
  const todayReturn = realtimeReturn || 0;
  const todayReturnPercentage = totalBalance > 0 ? (todayReturn / totalBalance) * 100 : 0;
  const dailyReturnRate = 0.04; // 0.04% ao dia
  
  // Projeção mensal
  const monthlyProjection = realtimeBalance * (1.012) - realtimeBalance; // 1.2% ao mês

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      
      {/* Valor Atual */}
      <StatCard
        title="Valor Atual"
        value={formatCurrencyHighPrecision(realtimeBalance)}
        change={`+${formatCurrencyHighPrecision(todayReturn)}`}
        changeType="positive"
        icon={<DollarSign className="w-4 h-4 text-blue-400" />}
        subtitle="Saldo total atualizado"
        isRealtime={true}
        delay={0}
      />

      {/* Total Investido */}
      <StatCard
        title="Total Investido"
        value={formatCurrency(totalInvested)}
        icon={<Target className="w-4 h-4 text-blue-400" />}
        subtitle="Aportes realizados"
        delay={0.1}
      />

      {/* Rendimento Total */}
      <StatCard
        title="Rendimento Total"
        value={formatCurrency(totalReturns)}
        change={`+${totalReturnPercentage.toFixed(2)}%`}
        changeType={totalReturns > 0 ? "positive" : "negative"}
        icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
        subtitle="Lucro acumulado"
        delay={0.2}
      />

      {/* Rendimento Hoje */}
      <StatCard
        title="Rendimento Hoje"
        value={formatCurrencyHighPrecision(todayReturn)}
        change={`+${todayReturnPercentage.toFixed(4)}%`}
        changeType="positive"
        icon={<Clock className="w-4 h-4 text-yellow-400" />}
        subtitle="Ganho do dia atual"
        isRealtime={true}
        delay={0.3}
      />

      {/* Taxa Diária */}
      <StatCard
        title="Taxa Diária"
        value={`${dailyReturnRate.toFixed(3)}%`}
        change={`≈ ${formatCurrencyHighPrecision(returnVelocity || 0)}/s`}
        changeType="positive"
        icon={<Percent className="w-4 h-4 text-cyan-400" />}
        subtitle="Rendimento por dia"
        delay={0.4}
      />

      {/* Projeção Mensal */}
      <StatCard
        title="Projeção Mensal"
        value={formatCurrency(monthlyProjection)}
        change="1.2% ao mês"
        changeType="positive"
        icon={<TrendingUp className="w-4 h-4 text-purple-400" />}
        subtitle="Estimativa próximo mês"
        delay={0.5}
      />
    </div>
  );
} 
"use client";

import { motion } from "framer-motion";
import { TrendingUp, Clock, DollarSign, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { use24HProgress } from "../_hooks/use-24h-progress";
import { useRealtimeReturns } from "../_hooks/use-realtime-returns";
import { formatCurrencyHighPrecision } from "@/features/investments/components/investments-columns";
import { formatCurrency } from "@/lib/utils";

interface BalanceCardsProps {
  totalBalance: number;
  totalInvested: number;
  returnPercentage: number;
  dailyReturnRate: number;
}

export default function BalanceCards({
  totalBalance,
  totalInvested,
  returnPercentage,
  dailyReturnRate,
}: BalanceCardsProps) {
  const { progressPercentage, formattedTime, isBusinessHours } = use24HProgress();
  const {
    accumulatedReturn,
    projectedBalance,
    secondlyReturn,
    projectedDailyReturn,
  } = useRealtimeReturns({
    totalBalance,
    dailyReturnRate,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Card 1: Saldo Total */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-gradient-to-br from-slate-900/80 via-blue-900/20 to-slate-900/80 border-slate-700/50 backdrop-blur-lg">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                  <DollarSign className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-400">Saldo Total</h3>
                  <p className="text-xs text-slate-500">Valor atual do portfólio</p>
                </div>
              </div>
              <Badge 
                className={`${
                  returnPercentage > 0 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                }`}
              >
                {returnPercentage > 0 ? '+' : ''}{returnPercentage.toFixed(3)}%
              </Badge>
            </div>

            <div className="space-y-3">
              {/* Saldo Principal */}
              <div>
                <div className="text-3xl font-bold text-white font-mono">
                  {formatCurrencyHighPrecision(projectedBalance)}
                </div>
                <div className="text-sm text-slate-400 mt-1">
                  Investido: {formatCurrency(totalInvested)}
                </div>
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
                <div>
                  <p className="text-xs text-slate-400">Rendimento Total</p>
                  <p className="text-lg font-semibold text-emerald-400 font-mono">
                    {formatCurrencyHighPrecision(totalBalance - totalInvested)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Valor/Segundo</p>
                  <p className="text-lg font-semibold text-cyan-400 font-mono">
                    +{formatCurrencyHighPrecision(secondlyReturn)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Card 2: Rendimento Diário com Progresso 24h */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-slate-900/80 via-emerald-900/20 to-slate-900/80 border-slate-700/50 backdrop-blur-lg">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-400">Rendimento Diário</h3>
                  <p className="text-xs text-slate-500">Progresso em tempo real</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-400 font-mono">{formattedTime}</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Rendimento Atual */}
              <div>
                <motion.div 
                  key={accumulatedReturn}
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="text-3xl font-bold text-emerald-400 font-mono"
                >
                  +{formatCurrencyHighPrecision(accumulatedReturn)}
                </motion.div>
                <div className="text-sm text-slate-400 mt-1">
                  Meta do dia: {formatCurrencyHighPrecision(projectedDailyReturn)}
                </div>
              </div>

              {/* Barra de Progresso 24h */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Progresso do Dia</span>
                  <span className="text-xs text-emerald-400 font-semibold">
                    {progressPercentage.toFixed(2)}%
                  </span>
                </div>
                
                <div className="relative">
                  <Progress 
                    value={progressPercentage} 
                    className="h-3 bg-slate-800 border border-slate-700"
                  />
                  <div 
                    className="absolute top-0 left-0 h-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>

                {/* Timeline */}
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>00:00</span>
                  <span>06:00</span>
                  <span>12:00</span>
                  <span>18:00</span>
                  <span>24:00</span>
                </div>
              </div>

              {/* Status do Mercado */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    isBusinessHours ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />
                  <span className="text-xs text-slate-400">
                    {isBusinessHours ? 'Horário Comercial' : 'Fora do Horário'}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Taxa: {dailyReturnRate.toFixed(4)}%/dia
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 
"use client";

import { motion } from "framer-motion";
import { TrendingUp, Calendar, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyHighPrecision } from "@/features/investments/components/investments-columns";
import { formatCurrency } from "@/lib/utils";
import { useRealtimeReturns } from "../_hooks/use-realtime-returns";
import { use24HProgress } from "../_hooks/use-24h-progress";
import type { BalanceCardProps } from "../_types";

export default function MainBalanceCard({
  totalBalance,
  totalInvested,
  returnPercentage,
  currentReturn,
}: BalanceCardProps) {
  
  // Hooks para tempo real
  const { currentReturn: realtimeReturn, returnVelocity } = useRealtimeReturns({
    totalBalance,
    dailyReturnRate: 0.04, // 1.2% ao mês ≈ 0.04% ao dia
  });

  const { progressPercentage } = use24HProgress();

  // Cálculos adicionais
  const totalReturns = totalBalance - totalInvested;
  const totalReturnPercentage = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;
  const dailyReturnPercentage = 0.04; // 0.04% ao dia
  const realtimeBalance = totalBalance + (realtimeReturn || 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="h-full relative"
    >
      <Card className="h-full bg-gradient-to-br from-blue-900/30 to-blue-800/20 dark:from-blue-950/40 dark:to-blue-900/30 border-blue-700/30 dark:border-blue-600/20 backdrop-blur-lg overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center justify-between">
            <span>Saldo Total</span>
            <Badge 
              variant="outline" 
              className={`${
                returnPercentage > 0 
                  ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                  : 'text-red-400 border-red-500/30 bg-red-500/10'
              } animate-pulse`}
            >
              {returnPercentage > 0 ? '+' : ''}{returnPercentage.toFixed(3)}%
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Valor Principal - Tempo Real */}
            <div>
              <motion.p 
                key={realtimeBalance}
                initial={{ scale: 1.02 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-3xl font-bold text-white font-mono"
              >
                {formatCurrencyHighPrecision(realtimeBalance)}
              </motion.p>
              <p className="text-sm text-blue-200/70 dark:text-blue-300/70">
                Valor total atual • Atualização em tempo real
              </p>
            </div>
            
            {/* Stats em Grid */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-blue-600/30 dark:border-blue-500/20">
              <div className="text-center">
                <Badge variant="secondary" className="mb-2 text-xs bg-blue-800/30 text-blue-200">
                  Total Investido
                </Badge>
                <p className="font-medium text-blue-100 dark:text-blue-200 text-sm">
                  {formatCurrency(totalInvested)}
                </p>
              </div>
              
              <div className="text-center">
                <Badge variant="secondary" className="mb-2 text-xs bg-emerald-800/30 text-emerald-200">
                  Total Ganho
                </Badge>
                <p className="font-medium text-emerald-400 text-sm">
                  {formatCurrency(totalReturns)}
                </p>
              </div>
              
              <div className="text-center">
                <Badge variant="secondary" className="mb-2 text-xs bg-cyan-800/30 text-cyan-200">
                  Rendimento Total
                </Badge>
                <p className="font-medium text-cyan-400 text-sm">
                  +{totalReturnPercentage.toFixed(2)}%
                </p>
              </div>
              
              <div className="text-center">
                <Badge variant="secondary" className="mb-2 text-xs bg-yellow-800/30 text-yellow-200">
                  Hoje
                </Badge>
                <p className="font-medium text-yellow-400 text-sm font-mono">
                  +{formatCurrencyHighPrecision(realtimeReturn || 0)}
                </p>
              </div>
            </div>

            {/* Progresso 24h */}
            <div className="pt-3 border-t border-blue-600/20 dark:border-blue-500/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-300" />
                  <span className="text-xs text-blue-200/70 dark:text-blue-300/70">
                    Progresso do Dia
                  </span>
                </div>
                <span className="text-xs text-blue-200/70 dark:text-blue-300/70">
                  {progressPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-blue-900/30 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-400 to-cyan-400 h-2 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          </div>
        </CardContent>

        {/* Rendimento Diário - Canto Inferior Direito */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="absolute bottom-4 right-4"
        >
          <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 backdrop-blur-sm rounded-lg p-2 border border-emerald-500/30">
            <div className="flex items-center gap-1">
              <Percent className="w-3 h-3 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-bold">
                +{dailyReturnPercentage.toFixed(3)}%/dia
              </span>
            </div>
            <div className="text-xs text-emerald-300/70 mt-1 font-mono">
              ≈ {formatCurrencyHighPrecision(returnVelocity || 0)}/s
            </div>
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
} 
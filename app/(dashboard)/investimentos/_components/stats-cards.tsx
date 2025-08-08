"use client";

import { motion } from "framer-motion";
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Target,
  PiggyBank,
  Percent,
  Clock,
  BarChart3
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InvestmentStats } from "../_types";
import { formatCurrency, formatPercentage, calculateFutureProjection } from "../_helpers";

interface StatsCardsProps {
  stats: InvestmentStats;
  isLoading?: boolean;
}

export function StatsCards({ stats, isLoading = false }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                </div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Cálculos avançados
  const totalPatrimonio = stats.totalInvestment + stats.totalReturns;
  const rentabilidadeMensal = (stats.returnPercentage / 30) * 100; // Convertendo para base mensal
  const projecao30Dias = calculateFutureProjection(totalPatrimonio, 30);
  const rendimentoDiario = totalPatrimonio * 0.000394520548; // Taxa diária fixa
  
  // Tempo para recuperar investimento (se houver prejuízo)
  const tempoBreakEven = stats.totalReturns < 0 
    ? Math.ceil(Math.abs(stats.totalReturns) / rendimentoDiario)
    : 0;

  const cards = [
    {
      title: "Patrimônio Total",
      value: totalPatrimonio,
      description: `${stats.activeInvestors} investidor${stats.activeInvestors !== 1 ? 'es' : ''} ativo${stats.activeInvestors !== 1 ? 's' : ''}`,
      icon: PiggyBank,
      bgGradient: "from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50",
      iconColor: "text-blue-600 dark:text-blue-400",
      badgeColor: "text-blue-600",
      delay: 0
    },
    {
      title: "Rendimento Acumulado", 
      value: stats.totalReturns,
      description: `${formatPercentage(stats.returnPercentage)} ROI total`,
      icon: TrendingUp,
      bgGradient: "from-emerald-50 to-emerald-100 dark:from-emerald-900/50 dark:to-emerald-800/50",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      badgeColor: "text-emerald-600",
      delay: 0.1
    },
    {
      title: "Rendimento Diário",
      value: rendimentoDiario,
      description: "~1.2% ao mês",
      icon: Calendar,
      bgGradient: "from-amber-50 to-amber-100 dark:from-amber-900/50 dark:to-amber-800/50",
      iconColor: "text-amber-600 dark:text-amber-400",
      badgeColor: "text-amber-600",
      delay: 0.2
    },
    {
      title: "Projeção (30 dias)",
      value: projecao30Dias.totalReturn,
      description: `Total: ${formatCurrency(projecao30Dias.futureBalance)}`,
      icon: BarChart3,
      bgGradient: "from-purple-50 to-purple-100 dark:from-purple-900/50 dark:to-purple-800/50",
      iconColor: "text-purple-600 dark:text-purple-400",
      badgeColor: "text-purple-600",
      delay: 0.3
    }
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: card.delay }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
          >
            <Card className={`relative overflow-hidden hover:shadow-lg transition-all duration-300 bg-gradient-to-br ${card.bgGradient} border-0`}>
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {card.title}
                    </h3>
                  </div>
                  <div className="p-2 rounded-lg bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                    <Icon className={`h-5 w-5 ${card.iconColor}`} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(card.value)}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs border-current ${card.badgeColor} bg-white/50 dark:bg-black/20 backdrop-blur-sm`}
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {card.description}
                    </Badge>
                  </div>
                </div>

                {/* Performance indicator */}
                {index === 1 && stats.totalReturns > 0 && (
                  <div className="absolute top-2 right-2">
                    <Badge 
                      className="bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30"
                    >
                      📈 Lucro
                    </Badge>
                  </div>
                )}

                {index === 1 && stats.totalReturns < 0 && tempoBreakEven > 0 && (
                  <div className="absolute top-2 right-2">
                    <Badge 
                      className="bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30"
                    >
                      ⏱️ {tempoBreakEven}d
                    </Badge>
                  </div>
                )}

                {/* Decorative element */}
                <div className="absolute -top-2 -right-2 w-20 h-20 rounded-full bg-white/10 dark:bg-black/10"></div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5 dark:bg-black/5"></div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
      
      {/* Card adicional com resumo da rentabilidade */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="sm:col-span-2 lg:col-span-4"
      >
        <Card className="bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 dark:from-indigo-900/30 dark:via-blue-900/30 dark:to-cyan-900/30 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl">
                  <Percent className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Análise de Rentabilidade
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Performance baseada na taxa diária de ~0.0395%
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    1.2%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Mensal
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatPercentage(stats.returnPercentage)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Acumulado
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                    {formatCurrency(stats.averageInvestmentPerInvestor)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Média/Investidor
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 
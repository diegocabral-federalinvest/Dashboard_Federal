"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DREData } from "@/features/finance/api/use-get-dre";
import { AlertCircle, ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface DataInsightsProps {
  data: DREData | null;
  isLoading: boolean;
}

type InsightType = 'positive' | 'neutral' | 'negative';

export const DataInsights: React.FC<DataInsightsProps> = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return (
      <Card className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Análise Financeira</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-500 dark:text-gray-400">
          Carregando análises financeiras...
        </CardContent>
      </Card>
    );
  }

  // Calculate insights
  const lucroPercentual = data.resultadoLiquido / (data.receitas.total || 1) * 100;
  const impostosPercentual = data.impostos.total / (data.receitas.total || 1) * 100;
  const despesasPercentual = data.despesas.total / (data.receitas.total || 1) * 100;

  // Determine insights based on financial metrics
  const insights = [
    {
      type: lucroPercentual > 15 ? 'positive' : lucroPercentual > 5 ? 'neutral' : 'negative',
      message: lucroPercentual > 15 
        ? `Margem de lucro excelente (${lucroPercentual.toFixed(1)}%)` 
        : lucroPercentual > 5 
          ? `Margem de lucro dentro do esperado (${lucroPercentual.toFixed(1)}%)` 
          : `Margem de lucro abaixo do esperado (${lucroPercentual.toFixed(1)}%)`
    },
    {
      type: impostosPercentual < 15 ? 'positive' : impostosPercentual < 25 ? 'neutral' : 'negative',
      message: impostosPercentual < 15 
        ? `Carga tributária otimizada (${impostosPercentual.toFixed(1)}%)` 
        : impostosPercentual < 25 
          ? `Carga tributária dentro da média (${impostosPercentual.toFixed(1)}%)` 
          : `Carga tributária elevada (${impostosPercentual.toFixed(1)}%)`
    },
    {
      type: despesasPercentual < 40 ? 'positive' : despesasPercentual < 60 ? 'neutral' : 'negative',
      message: despesasPercentual < 40 
        ? `Despesas bem controladas (${despesasPercentual.toFixed(1)}%)` 
        : despesasPercentual < 60 
          ? `Nível de despesas dentro do esperado (${despesasPercentual.toFixed(1)}%)` 
          : `Despesas acima do ideal (${despesasPercentual.toFixed(1)}%)`
    }
  ];

  // Tax deduction effectiveness - if applicable
  if (data.deducaoFiscal && data.deducaoFiscal > 0) {
    const economiaEstimada = data.deducaoFiscal * 0.24; // Estimativa simplificada (15% IR + 9% CSLL)
    insights.push({
      type: 'positive',
      message: `Dedução fiscal gerando economia estimada de ${formatCurrency(economiaEstimada)}`
    });
  }

  // Get icon based on insight type
  const getIcon = (type: InsightType) => {
    switch (type) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <ArrowUpRight className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <Card className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Análise Financeira</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "flex items-start gap-2 pb-2",
                index < insights.length - 1 && "border-b border-gray-200 dark:border-gray-800"
              )}
            >
              <div className={cn(
                "mt-0.5 p-1 rounded-full",
                insight.type === 'positive' && "bg-green-100 dark:bg-green-900/30",
                insight.type === 'neutral' && "bg-blue-100 dark:bg-blue-900/30",
                insight.type === 'negative' && "bg-red-100 dark:bg-red-900/30"
              )}>
                {getIcon(insight.type as InsightType)}
              </div>
              <p className={cn(
                "text-sm",
                insight.type === 'positive' && "text-green-800 dark:text-green-300",
                insight.type === 'neutral' && "text-blue-800 dark:text-blue-300",
                insight.type === 'negative' && "text-red-800 dark:text-red-300"
              )}>
                {insight.message}
              </p>
            </motion.div>
          ))}
          
          {insights.length === 0 && (
            <div className="flex items-center gap-2 py-3">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Não há dados suficientes para gerar análises financeiras.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 
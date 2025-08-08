"use client";

import React from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Banknote, 
  CreditCard, 
  Wallet, 
  Calculator, 
  BarChartBig,
  LineChart,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Percent
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { DREData } from "@/features/finance/api/use-get-dre";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { FinancialInfoTooltip } from "@/components/ui/financial-tooltip";

interface SummaryMetricsProps {
  data: DREData | null;
  isLoading: boolean;
  error: Error | null;
}

const getPercentageDifference = (current: number, previous: number) => {
  if (previous === 0) return 0;
  return ((current - previous) / Math.abs(previous)) * 100;
};

// Mockup of previous period data for demo purposes
// In a real implementation, this would come from API
const getPreviousPeriodData = (data: DREData) => ({
  receitaBruta: data.receitas.total * 0.93,  // 7% less in previous period
  despesaTotal: data.despesas.total * 0.96,  // 4% less expenses before
  resultadoLiquido: data.resultadoLiquido * 0.89, // 11% less profit before
  impostoTotal: (data.impostos?.ir || 0) + (data.impostos?.csll || 0) * 0.95, // 5% less tax
  margemLiquida: ((data.resultadoLiquido / data.receitas.total) * 100) * 0.96, // 4% less margin
});

// Componente de card melhorado conforme solicitado
const ImprovedMetricCard: React.FC<{
  title: string;
  value: string;
  percentChange: number;
  icon: React.ReactNode;
  tooltip: string;
  animationDelay: number;
  isExpenseType?: boolean;
}> = ({ title, value, percentChange, icon, tooltip, animationDelay, isExpenseType = false }) => {
  const isPositive = isExpenseType ? percentChange < 0 : percentChange > 0;
  const isNegative = isExpenseType ? percentChange > 0 : percentChange < 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5,
        delay: animationDelay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
    >
      <Card className="border shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <FinancialInfoTooltip 
                title={title}
                description={`Informações sobre ${title.toLowerCase()}`}
                value={value}
                variant="info"
              >
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {title}
                </p>
              </FinancialInfoTooltip>
              
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {value}
              </div>
              
             
            </div>
            
            <div className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
              <div className="text-gray-600 dark:text-gray-400">
                {icon}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const SummaryMetrics: React.FC<SummaryMetricsProps> = ({ 
  data, 
  isLoading,
  error
}) => {
  if (isLoading) {
    return <SkeletonMetrics />;
  }

  if (error || !data) {
    return <div className="text-red-500">Erro ao carregar métricas.</div>;
  }

  const previousData = getPreviousPeriodData(data);
  const receitaBruta = data.receitas.total;
  const despesaTotal = data.despesas.total;
  const resultadoLiquido = data.resultadoLiquido;
  const impostoTotal = (data.impostos?.ir || 0) + (data.impostos?.csll || 0);
  const margemLiquida = (resultadoLiquido / receitaBruta) * 100;

  // Calculate percentage changes
  const receitaChange = getPercentageDifference(receitaBruta, previousData.receitaBruta);
  const despesaChange = getPercentageDifference(despesaTotal, previousData.despesaTotal);
  const resultadoChange = getPercentageDifference(resultadoLiquido, previousData.resultadoLiquido);
  const impostoChange = getPercentageDifference(impostoTotal, previousData.impostoTotal);
  const margemChange = getPercentageDifference(margemLiquida, previousData.margemLiquida);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
      <ImprovedMetricCard 
        title="Receita Bruta"
        value={formatCurrency(receitaBruta)}
        percentChange={receitaChange}
        icon={<Banknote className="h-5 w-5" />}
        tooltip="receita-bruta"
        animationDelay={0}
      />
      
      <ImprovedMetricCard 
        title="Resultado Líquido"
        value={formatCurrency(resultadoLiquido)}
        percentChange={resultadoChange}
        icon={<Wallet className="h-5 w-5" />}
        tooltip="resultado-liquido"
        animationDelay={0.1}
      />
      
      <ImprovedMetricCard 
        title="Despesas Totais"
        value={formatCurrency(despesaTotal)}
        percentChange={despesaChange}
        icon={<CreditCard className="h-5 w-5" />}
        tooltip="despesas"
        animationDelay={0.2}
        isExpenseType={true}
      />
      
      <ImprovedMetricCard 
        title="Impostos"
        value={formatCurrency(impostoTotal)}
        percentChange={impostoChange}
        icon={<Calculator className="h-5 w-5" />}
        tooltip="impostos"
        animationDelay={0.3}
        isExpenseType={true}
      />
      
      <ImprovedMetricCard 
        title="Margem Líquida"
        value={`${margemLiquida.toFixed(1)}%`}
        percentChange={margemChange}
        icon={<Percent className="h-5 w-5" />}
        tooltip="margem-liquida"
        animationDelay={0.4}
      />
    </div>
  );
};

const SkeletonMetrics = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-3 rounded-lg border">
          <div className="flex items-start justify-between">
            <div className="space-y-2 w-full">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-3 w-full" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}; 
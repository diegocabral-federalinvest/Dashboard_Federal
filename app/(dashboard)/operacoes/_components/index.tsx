import React from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Receipt,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  PieChart
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { motion, Variants } from "framer-motion";
import type { FinancialSummary } from "../_types";

interface FinancialStatsCardsProps {
  summary: FinancialSummary;
  entriesCount: number;
  expensesCount: number;
}

export const FinancialStatsCards: React.FC<FinancialStatsCardsProps> = ({ 
  summary, 
  entriesCount, 
  expensesCount 
}) => {
  const {
    totalEntries,
    totalExpenses,
    netResult,
    payrollExpenses,
    nonPayrollExpenses,
    taxableExpenses,
    nonTaxableExpenses,
    totalOperationsCount,
    payrollExpensesCount,
    taxableExpensesCount
  } = summary;

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {/* Card de Entradas - Verde Moderno */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        transition={{ delay: 0 * 0.1 }}
        className="group relative overflow-hidden"
      >
        <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 hover:border-green-200 dark:hover:border-green-800">
          {/* Borda inferior grossa - Verde */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-green-600 to-emerald-500"></div>
          
          {/* Header do Card */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Entradas
                </h3>
              </div>
              <ArrowUpRight className="h-4 w-4 text-green-500 opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Valor Principal */}
            <div className="space-y-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalEntries > 0 ? formatCurrency(totalEntries) : "R$ 0,00"}
              </p>
              
              {/* Informações Secundárias */}
              <div className="flex flex-col items-center space-x-2">
                <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium">
                  {entriesCount > 0 ? `${entriesCount} transações` : "Sem dados"}
                </span>
           
               
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Card de Despesas Totais - Vermelho Moderno */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        transition={{ delay: 1 * 0.1 }}
        className="group relative overflow-hidden"
      >
        <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 hover:border-red-200 dark:hover:border-red-800">
          {/* Borda inferior grossa - Vermelho */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-600 to-rose-500"></div>
          
          {/* Header do Card */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Despesas
                </h3>
              </div>
              <ArrowDownRight className="h-4 w-4 text-red-500 opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Valor Principal */}
            <div className="space-y-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalExpenses > 0 ? formatCurrency(totalExpenses) : "R$ 0,00"}
              </p>
              
              {/* Informações Secundárias */}
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-medium">
                    {expensesCount > 0 ? `${expensesCount} transações` : "Sem dados"}
                  </span>
                  {taxableExpensesCount > 0 && (
                    <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                      {taxableExpensesCount} tributáveis
                    </span>
                  )}
                </div>
                {taxableExpenses > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Tributáveis: {formatCurrency(taxableExpenses)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Card de Despesas de Folha - Laranja/Âmbar Moderno */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        transition={{ delay: 2 * 0.1 }}
        className="group relative overflow-hidden"
      >
        <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 hover:border-amber-200 dark:hover:border-amber-800">
          {/* Borda inferior grossa - Âmbar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500"></div>
          
          {/* Header do Card */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-lg">
                  <Receipt className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Por Tipo
                </h3>
              </div>
              <PieChart className="h-4 w-4 text-amber-500 opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Valor Principal */}
            <div className="space-y-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {payrollExpenses > 0 ? formatCurrency(payrollExpenses) : "R$ 0,00"}
              </p>
              
              {/* Informações Secundárias */}
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-medium">
                    Folha de Pagamento
                  </span>
                </div>
                {payrollExpenses > 0 && totalExpenses > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                      Outras: {formatCurrency(nonPayrollExpenses)}
                    </span>
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      {((payrollExpenses / totalExpenses) * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Card de Resultado Líquido - Dinâmico */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        transition={{ delay: 3 * 0.1 }}
        className="group relative overflow-hidden"
      >
        <div className={`relative bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 ${
          totalOperationsCount === 0 
            ? "hover:border-gray-300 dark:hover:border-gray-700"
            : netResult >= 0 
              ? "hover:border-emerald-200 dark:hover:border-emerald-800"
              : "hover:border-rose-200 dark:hover:border-rose-800"
        }`}>
          {/* Borda inferior grossa - Dinâmica */}
          <div className={`absolute bottom-0 left-0 right-0 h-1 ${
            totalOperationsCount === 0
              ? "bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400"
              : netResult >= 0 
                ? "bg-gradient-to-r from-emerald-500 via-green-600 to-teal-500"
                : "bg-gradient-to-r from-rose-500 via-red-600 to-pink-500"
          }`}></div>
          
          {/* Header do Card */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  totalOperationsCount === 0
                    ? "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900/30 dark:to-gray-800/30"
                    : netResult >= 0 
                      ? "bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30"
                      : "bg-gradient-to-br from-rose-100 to-red-100 dark:from-rose-900/30 dark:to-red-900/30"
                }`}>
                  <DollarSign className={`h-5 w-5 ${
                    totalOperationsCount === 0
                      ? "text-gray-600 dark:text-gray-400"
                      : netResult >= 0 
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                  }`} />
                </div>
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Resultado
                </h3>
              </div>
              <Target className={`h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity ${
                totalOperationsCount === 0
                  ? "text-gray-500"
                  : netResult >= 0 
                    ? "text-emerald-500"
                    : "text-rose-500"
              }`} />
            </div>

            {/* Valor Principal */}
            <div className="space-y-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalOperationsCount > 0 ? formatCurrency(Math.abs(netResult)) : "R$ 0,00"}
              </p>
              
              {/* Informações Secundárias */}
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center text-xs px-2 py-1 rounded-full font-medium ${
                    totalOperationsCount === 0
                      ? "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300"
                      : netResult >= 0 
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                        : "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300"
                  }`}>
                    {totalOperationsCount > 0 ? (netResult >= 0 ? "Lucro" : "Prejuízo") : "Sem dados"}
                  </span>
                </div>
                {totalOperationsCount > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                      {entriesCount + expensesCount} operações
                    </span>
                    <span className={`font-medium ${
                      netResult >= 0 
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}>
                      {entriesCount}E + {expensesCount}D
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

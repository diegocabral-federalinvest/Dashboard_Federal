"use client";

import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BarChart3 } from "lucide-react";
import { formatCurrencyHighPrecision } from "@/features/investments/components/investments-columns";
import { formatCurrency } from "@/lib/utils";

interface PortfolioChartProps {
  data: Array<{
    date: string;
    value: number;
    invested: number;
    returns: number;
  }>;
  currentBalance: number;
  totalInvested: number;
}

export default function PortfolioChart({
  data,
  currentBalance,
  totalInvested,
}: PortfolioChartProps) {
  // Calcular crescimento
  const firstValue = data.length > 0 ? data[0].value : 0;
  const lastValue = data.length > 0 ? data[data.length - 1].value : 0;
  const growth = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-blue-900/90 dark:bg-blue-950/90 border border-blue-600/30 dark:border-blue-500/20 p-4 rounded-lg shadow-lg backdrop-blur-sm">
          <p className="text-blue-100 dark:text-blue-200 text-sm font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="h-full"
    >
      <Card className="h-full bg-gradient-to-br from-blue-900/30 to-blue-800/20 dark:from-blue-950/40 dark:to-blue-900/30 border-blue-700/30 dark:border-blue-600/20 backdrop-blur-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-300" />
              <span>Evolução do Portfolio</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="text-emerald-400 font-medium">
                +{growth.toFixed(2)}%
              </span>
              <span className="text-blue-200/70 dark:text-blue-300/70">Últimos 30 dias</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1e40af" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#1e40af" 
                  strokeOpacity={0.2}
                />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#93c5fd', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#93c5fd', fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value).slice(0, -3)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#portfolioGradient)"
                  name="Saldo Total"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-blue-600/30 dark:border-blue-500/20">
            <div className="text-center">
              <p className="text-sm text-blue-200/70 dark:text-blue-300/70">Saldo Atual</p>
              <p className="font-bold text-white text-lg">
                {formatCurrency(currentBalance)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-blue-200/70 dark:text-blue-300/70">Total Investido</p>
              <p className="font-bold text-blue-100 dark:text-blue-200 text-lg">
                {formatCurrency(totalInvested)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-blue-200/70 dark:text-blue-300/70">Rendimento</p>
              <p className="font-bold text-emerald-400 text-lg">
                {formatCurrency(currentBalance - totalInvested)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 
"use client";

import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartData } from "../_hooks/use-chart-data";
import { Button } from "@/components/ui/button";
import { Maximize2, X } from "lucide-react";
import { ActionTooltip } from "@/components/ui/financial-tooltip";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  Colors
} from 'chart.js';
import { Bar, Doughnut, Pie, Line } from 'react-chartjs-2';
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  Colors
);

interface DREChartProps {
  title: string;
  data: ChartData | null;
  options?: any;
  isLoading: boolean;
  error: Error | null;
  type?: 'bar' | 'doughnut' | 'pie' | 'line';
  className?: string;
  expandable?: boolean;
  animationIndex?: number;
}

export function DREChart({
  title,
  data,
  options,
  isLoading,
  error,
  type = 'bar',
  className,
  expandable = false,
  animationIndex = 0,
}: DREChartProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isChartReady, setIsChartReady] = useState(false);

  // Animation control to ensure chart displays after the container animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChartReady(true);
    }, 300 + animationIndex * 100);
    
    return () => clearTimeout(timer);
  }, [animationIndex]);

  if (isLoading) {
    return (
      <div className={cn("h-full border rounded-lg bg-white dark:bg-gray-900 shadow-sm", className)}>
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          {expandable && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full opacity-70 hover:opacity-100"
              disabled
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
          )}
        </div>
        <div className="h-[200px] flex items-center justify-center p-3">
          <Skeleton className="h-[180px] w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("h-full border rounded-lg bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30", className)}>
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          {expandable && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full opacity-70 hover:opacity-100"
              disabled
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
          )}
        </div>
        <div className="h-[200px] flex items-center justify-center p-3">
          <div className="text-red-500 text-center text-sm">
            Erro ao carregar dados do gráfico
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={cn("h-full border rounded-lg bg-white dark:bg-gray-900 shadow-sm", className)}>
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          {expandable && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full opacity-70 hover:opacity-100"
              disabled
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
          )}
        </div>
        <div className="h-[200px] flex items-center justify-center p-3">
          <div className="text-muted-foreground text-center text-sm">
            Nenhum dado disponível para este período
          </div>
        </div>
      </div>
    );
  }
  
  // Choose the chart component based on type
  const ChartComponent = {
    'bar': Bar,
    'doughnut': Doughnut,
    'pie': Pie,
    'line': Line
  }[type];

  // Set chart height based on type
  const chartHeight = 'h-[200px]';
  
  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        delay: animationIndex * 0.1,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };
  
  // Custom chart options
  const chartOptions = {
    ...options,
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800,
      easing: 'easeOutQuart'
    },
    plugins: {
      ...options?.plugins,
      legend: {
        display: type !== 'bar',
        position: 'bottom',
        align: 'start',
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          boxHeight: 6,
          padding: 12,
          font: {
            size: 10
          }
        }
      }
    }
  };

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={cn("transition-all duration-300 h-full", className)}
      >
        <div className="h-full border rounded-lg bg-white dark:bg-gray-900 shadow-sm">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
            {expandable && (
              <ActionTooltip content="Expandir gráfico" variant="info">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full opacity-70 hover:opacity-100"
                  onClick={() => setIsExpanded(true)}
                >
                  <Maximize2 className="h-3 w-3" />
                </Button>
              </ActionTooltip>
            )}
          </div>
          <div className={cn("relative p-3", chartHeight)}>
            <AnimatePresence mode="wait">
              {isChartReady && (
                <motion.div 
                  className="absolute inset-3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <ChartComponent data={data} options={chartOptions} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Expanded chart dialog */}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-3xl p-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg">
          <div className="p-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{title}</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setIsExpanded(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="h-[500px] w-full">
              <ChartComponent data={data} options={chartOptions} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Variação especial para o gráfico de tendência de impostos
export const TaxTrendChart: React.FC<DREChartProps> = (props) => {
  // Opções específicas para o gráfico de tendência
  const trendOptions = {
    ...props.options,
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('pt-BR', { 
              style: 'currency', 
              currency: 'BRL',
              maximumFractionDigits: 0
            }).format(value);
          }
        }
      }
    },
    plugins: {
      ...props.options?.plugins,
      tooltip: {
        ...props.options?.plugins?.tooltip,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    }
  };
  
  return (
    <DREChart 
      {...props} 
      type="line" 
      options={trendOptions}
      className="h-[260px] dark:bg-gray-900/95 backdrop-blur-lg"
      expandable={true}
    />
  );
};
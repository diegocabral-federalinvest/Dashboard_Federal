"use client";

import { useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
  Filler
} from "chart.js";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Define series interface
export interface ChartSeries {
  id: string;
  label: string;
  data: number[];
  color: string;
  borderColor?: string;
  backgroundColor?: string;
  fill?: boolean;
  tension?: number;
  hidden?: boolean;
}

// Define chart data interface
export interface MultiLineChartProps {
  data: any[];
  categories: string[];
  colors: string[];
  height?: number;
  title?: string;
  description?: string;
}

export function MultiLineChart({
  data = [],
  categories = [],
  colors = ["#3b82f6", "#10b981"],
  height = 300,
  title,
  description,
}: MultiLineChartProps) {
  // Format number as currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Create chart data
  const chartData: ChartData<"line"> = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Extract labels (dates) from the first item in each dataset
    const labels = data.map(item => item.date || '');
    
    // Create datasets for each category
    const datasets = categories.map((category, index) => ({
      label: category,
      data: data.map(item => item[category] || 0),
      borderColor: colors[index % colors.length],
      backgroundColor: `${colors[index % colors.length]}20`,
      fill: false,
      tension: 0.4,
      pointRadius: 3,
      pointHoverRadius: 5,
      pointBackgroundColor: colors[index % colors.length],
      pointBorderColor: "#fff",
      pointBorderWidth: 1,
    }));

    return {
      labels,
      datasets,
    };
  }, [data, categories, colors]);

  // Chart options
  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        align: "end" as const,
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: (context) => {
            const value = context.raw as number;
            const label = context.dataset.label || "";
            return `${label}: ${formatCurrency(value)}`;
          },
        },
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        padding: 10,
        cornerRadius: 4,
        titleFont: {
          size: 13,
          weight: "bold",
        },
        bodyFont: {
          size: 12,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: "rgba(107, 114, 128, 0.1)",
        },
        ticks: {
          maxRotation: 0,
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: "rgba(107, 114, 128, 0.1)",
        },
        ticks: {
          font: {
            size: 11,
          },
          callback: (value) => {
            const numValue = value as number;
            if (numValue >= 1000000) {
              return `R$ ${(numValue / 1000000).toFixed(1)}M`;
            } else if (numValue >= 1000) {
              return `R$ ${(numValue / 1000).toFixed(1)}K`;
            }
            return `R$ ${numValue}`;
          },
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  };

  return (
    <div style={{ height }}>
      <Line data={chartData} options={options} />
    </div>
  );
} 
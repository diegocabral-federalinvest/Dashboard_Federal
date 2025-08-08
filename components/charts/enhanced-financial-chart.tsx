"use client";

import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { 
  Maximize2, Download, Filter, Eye, EyeOff, ChevronDown, 
  ZoomIn, ZoomOut, RotateCcw, Grid, Palette, FileImage, 
  FileText, Settings, TrendingUp, MousePointer2, Move3D
} from "lucide-react";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart,
  Brush, ReferenceLine, ReferenceArea
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/glass-card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ChartExportService } from "@/lib/services/chart-export-service";
import { useToast } from "@/components/ui/use-toast";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface EnhancedFinancialChartProps {
  data: any[];
  periodType: "monthly" | "quarterly" | "annual";
  currentPeriod: {
    year: number;
    month?: number;
    quarter?: number;
    periodType: "monthly" | "quarterly" | "annual";
  };
  showMetricsSummary?: boolean;
  enableAllVariables?: boolean;
  title?: string;
  className?: string;
}

// Definir todas as variáveis financeiras disponíveis com cores profissionais
const FINANCIAL_VARIABLES = [
  // Operação
  { key: 'valorFator', label: 'Valor Fator', color: '#10b981', group: 'operacao', icon: '💰' },
  { key: 'valorAdvalorem', label: 'Valor Advalorem', color: '#059669', group: 'operacao', icon: '📈' },
  { key: 'valorTarifas', label: 'Valor Tarifas', color: '#047857', group: 'operacao', icon: '📦' },
  { key: 'deducao', label: 'Dedução', color: '#0d9488', group: 'operacao', icon: '⚡' },
  
  // Receita Bruta
  { key: 'receitaBruta', label: 'Receita Bruta', color: '#22c55e', group: 'receitaBruta', icon: '💵' },
  { key: 'pis', label: 'PIS', color: '#16a34a', group: 'receitaBruta', icon: '🏛️' },
  { key: 'cofins', label: 'COFINS', color: '#15803d', group: 'receitaBruta', icon: '📜' },
  { key: 'issqn', label: 'ISSQN', color: '#166534', group: 'receitaBruta', icon: '🏪' },
  
  // Receita Líquida
  { key: 'receitaLiquida', label: 'Receita Líquida', color: '#3b82f6', group: 'receitaLiquida', icon: '💎' },
  { key: 'despesasTributaveis', label: 'Despesas Tributáveis', color: '#1d4ed8', group: 'receitaLiquida', icon: '🏢' },
  { key: 'despesasNaoTributaveis', label: 'Despesas Não Tributáveis', color: '#1e40af', group: 'receitaLiquida', icon: '📊' },
  
  // Resultado Bruto
  { key: 'resultadoBruto', label: 'Resultado Bruto', color: '#8b5cf6', group: 'resultadoBruto', icon: '📋' },
  { key: 'csll', label: 'CSLL', color: '#7c3aed', group: 'resultadoBruto', icon: '🧾' },
  { key: 'irpj', label: 'IRPJ', color: '#6d28d9', group: 'resultadoBruto', icon: '💼' },
  
  // Entradas
  { key: 'entradas', label: 'Entradas', color: '#f59e0b', group: 'entradas', icon: '🔄' },
  
  // Resultado Líquido
  { key: 'resultadoLiquido', label: 'Resultado Líquido', color: '#ef4444', group: 'resultadoLiquido', icon: '✅' },
];

const VARIABLE_GROUPS = {
  operacao: { 
    label: 'Operação', 
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    borderColor: 'border-green-200 dark:border-green-800',
    icon: '💰'
  },
  receitaBruta: { 
    label: 'Receita Bruta', 
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    icon: '💵'
  },
  receitaLiquida: { 
    label: 'Receita Líquida', 
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    borderColor: 'border-blue-200 dark:border-blue-800',
    icon: '💎'
  },
  resultadoBruto: { 
    label: 'Resultado Bruto', 
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
    borderColor: 'border-purple-200 dark:border-purple-800',
    icon: '📋'
  },
  entradas: { 
    label: 'Entradas', 
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    icon: '🔄'
  },
  resultadoLiquido: { 
    label: 'Resultado Líquido', 
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    borderColor: 'border-red-200 dark:border-red-800',
    icon: '✅'
  },
};

export function EnhancedFinancialChart({ 
  data, 
  periodType, 
  currentPeriod,
  showMetricsSummary = true,
  enableAllVariables = false,
  title = "Evolução Financeira",
  className
}: EnhancedFinancialChartProps) {
  // Estados principais
  const [isExpanded, setIsExpanded] = useState(false);
  const [chartType, setChartType] = useState<"line" | "bar" | "area">("area");
  const [selectedVariables, setSelectedVariables] = useState<string[]>(
    enableAllVariables 
      ? ['valorFator', 'receitaBruta', 'receitaLiquida', 'resultadoBruto', 'entradas', 'resultadoLiquido'] 
      : ['valorFator', 'receitaBruta', 'resultadoLiquido']
  );
  
  // Estados de configuração avançada
  const [showGrid, setShowGrid] = useState(false);
  const [smoothLines, setSmoothLines] = useState(true);
  const [fillOpacity, setFillOpacity] = useState([30]);
  const [strokeWidth, setStrokeWidth] = useState([2]);
  const [animationSpeed, setAnimationSpeed] = useState([800]);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // Estados de exportação
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<"png" | "pdf" | null>(null);
  
  // Refs
  const chartRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  const { theme } = useTheme();

  // Processar dados para o gráfico
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      // Gerar dados de exemplo mais realistas
      const exampleData = [];
      const currentYear = currentPeriod.year;
      const currentMonth = currentPeriod.month || 1;
      const currentQuarter = currentPeriod.quarter || 1;

      const generateFinancialData = () => {
        const baseValue = Math.random() * 400000 + 200000;
        const baseExpenses = Math.random() * 300000 + 150000;
        const baseBrutoResult = baseValue - baseExpenses;
        const baseLiquidoResult = baseBrutoResult * 0.85;
        
        return {
          // Operação
          valorFator: baseValue * 0.95,
          valorAdvalorem: baseValue * 0.02,
          valorTarifas: baseValue * 0.03,
          deducao: baseValue * 0.05,
          
          // Receita Bruta
          receitaBruta: baseValue,
          pis: baseValue * 0.0165,
          cofins: baseValue * 0.076,
          issqn: baseValue * 0.02,
          
          // Receita Líquida
          receitaLiquida: baseValue * 0.95,
          despesasTributaveis: baseExpenses * 0.7,
          despesasNaoTributaveis: baseExpenses * 0.3,
          
          // Resultado Bruto
          resultadoBruto: baseBrutoResult,
          csll: baseBrutoResult * 0.09,
          irpj: baseBrutoResult * 0.15,
          
          // Entradas
          entradas: baseValue * 1.1,
          
          // Resultado Líquido
          resultadoLiquido: baseLiquidoResult,
        };
      };

      if (periodType === "annual") {
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        for (let month = 1; month <= 12; month++) {
          exampleData.push({
            period: monthNames[month - 1],
            ...generateFinancialData(),
          });
        }
      } else if (periodType === "quarterly") {
        const quarterMonths = {
          1: ["Jan", "Fev", "Mar"],
          2: ["Abr", "Mai", "Jun"], 
          3: ["Jul", "Ago", "Set"],
          4: ["Out", "Nov", "Dez"]
        };
        const months = quarterMonths[currentQuarter as keyof typeof quarterMonths];
        for (let i = 0; i < 3; i++) {
          exampleData.push({
            period: months[i],
            ...generateFinancialData(),
          });
        }
      } else {
        // Mensal: mostrar últimos 6 meses
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        for (let i = 5; i >= 0; i--) {
          const month = currentMonth - i;
          const adjustedMonth = month <= 0 ? month + 12 : month;
          const year = month <= 0 ? currentYear - 1 : currentYear;
          
          exampleData.push({
            period: monthNames[adjustedMonth - 1],
            ...generateFinancialData(),
          });
        }
      }

      return exampleData;
    }

    return data;
  }, [data, periodType, currentPeriod]);

  // Filtrar variáveis selecionadas
  const filteredVariables = useMemo(() => {
    return FINANCIAL_VARIABLES.filter(variable => 
      selectedVariables.includes(variable.key)
    );
  }, [selectedVariables]);

  // Toggle de variáveis
  const toggleVariable = useCallback((variableKey: string) => {
    setSelectedVariables(prev => {
      if (prev.includes(variableKey)) {
        return prev.filter(key => key !== variableKey);
      } else {
        return [...prev, variableKey];
      }
    });
  }, []);

  // Toggle de grupo completo
  const toggleGroup = useCallback((groupKey: string) => {
    const groupVariables = FINANCIAL_VARIABLES
      .filter(variable => variable.group === groupKey)
      .map(variable => variable.key);

    const allSelected = groupVariables.every(key => selectedVariables.includes(key));

    if (allSelected) {
      setSelectedVariables(prev => prev.filter(key => !groupVariables.includes(key)));
    } else {
      setSelectedVariables(prev => {
        const newSet = new Set([...prev, ...groupVariables]);
        return Array.from(newSet);
      });
    }
  }, [selectedVariables]);

  // Controle de zoom com mouse wheel
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoomLevel(prev => Math.max(0.5, Math.min(3, prev + delta)));
      }
    };

    const chartElement = chartContainerRef.current;
    if (chartElement) {
      chartElement.addEventListener('wheel', handleWheel, { passive: false });
      return () => chartElement.removeEventListener('wheel', handleWheel);
    }
  }, []);

  // Tooltip customizado avançado
  const customTooltip = useCallback(({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 min-w-[200px]">
          <p className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">{label}</p>
          <div className="space-y-2">
            {payload
              .sort((a: any, b: any) => b.value - a.value)
              .map((entry: any, index: number) => (
                <div key={index} className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full shadow-sm" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {entry.name}:
                    </span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    {entry.name === 'Margem (%)' 
                      ? `${entry.value.toFixed(1)}%` 
                      : formatCurrency(entry.value)
                    }
                  </span>
                </div>
              ))}
          </div>
        </div>
      );
    }
    return null;
  }, []);

  // Hook de toast para notificações
  const { toast } = useToast();

  // Função de exportação avançada
  const handleExport = useCallback(async (type: "png" | "pdf") => {
    if (!chartRef.current) {
      toast({
        title: "Erro na exportação",
        description: "Gráfico não encontrado para exportação",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    setExportType(type);

    try {
      const periodDescription = (() => {
        switch (periodType) {
          case "annual": return `Dados Anuais - ${currentPeriod.year}`;
          case "quarterly": return `${currentPeriod.quarter}º Trimestre ${currentPeriod.year}`;
          case "monthly": return `${currentPeriod.month}/${currentPeriod.year}`;
          default: return `Período: ${currentPeriod.year}`;
        }
      })();

      const exportOptions = {
        filename: `federal-invest-${periodType}-${currentPeriod.year}${currentPeriod.quarter ? `-q${currentPeriod.quarter}` : ''}${currentPeriod.month ? `-m${currentPeriod.month}` : ''}`,
        title: title,
        subtitle: `${periodDescription} • ${filteredVariables.length} variáveis`,
        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
      };

      if (type === 'png') {
        await ChartExportService.exportToPNG(chartRef.current, exportOptions);
        toast({
          title: "Exportação concluída!",
          description: "Gráfico exportado como PNG com sucesso",
        });
      } else {
        await ChartExportService.exportToPDF(chartRef.current, exportOptions);
        toast({
          title: "Relatório PDF gerado!",
          description: "Relatório profissional exportado com sucesso",
        });
      }
    } catch (error) {
      console.error('Erro na exportação:', error);
      toast({
        title: "Erro na exportação",
        description: `Falha ao exportar como ${type.toUpperCase()}. Tente novamente.`,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  }, [chartRef, title, periodType, currentPeriod, filteredVariables, theme, toast]);

  // Renderizar gráfico baseado no tipo
  const renderChart = useCallback(() => {
    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 60 }
    };

    const commonAxisProps = {
      stroke: theme === "dark" ? "#6b7280" : "#9ca3af",
      fontSize: 12,
      fontFamily: 'Inter, sans-serif'
    };

    const gridProps = showGrid ? {
      strokeDasharray: "3 3", 
      stroke: theme === "dark" ? "#374151" : "#e5e7eb",
      opacity: 0.5
    } : { stroke: "none" };

    switch (chartType) {
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid {...gridProps} />
            <XAxis 
              dataKey="period" 
              {...commonAxisProps}
              tick={{ fontSize: 11 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              {...commonAxisProps}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={customTooltip} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="rect"
              wrapperStyle={{ paddingTop: '20px' }}
            />
            {filteredVariables.map((variable) => (
              <Bar 
                key={variable.key}
                dataKey={variable.key} 
                fill={variable.color}
                name={variable.label}
                radius={[2, 2, 0, 0]}
                animationDuration={animationSpeed[0]}
              />
            ))}
          </BarChart>
        );
        
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid {...gridProps} />
            <XAxis 
              dataKey="period" 
              {...commonAxisProps}
              tick={{ fontSize: 11 }}
            />
            <YAxis 
              {...commonAxisProps}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={customTooltip} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="line"
              wrapperStyle={{ paddingTop: '20px' }}
            />
            {filteredVariables.map((variable) => (
              <Line 
                key={variable.key}
                type={smoothLines ? "monotone" : "linear"}
                dataKey={variable.key} 
                stroke={variable.color} 
                strokeWidth={strokeWidth[0]}
                name={variable.label}
                dot={{ r: 4, strokeWidth: 2, fill: variable.color }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={animationSpeed[0]}
              />
            ))}
          </LineChart>
        );
        
      default: // area
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid {...gridProps} />
            <XAxis 
              dataKey="period" 
              {...commonAxisProps}
              tick={{ fontSize: 11 }}
            />
            <YAxis 
              {...commonAxisProps}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={customTooltip} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="rect"
              wrapperStyle={{ paddingTop: '20px' }}
            />
            {filteredVariables.map((variable) => (
              <Area 
                key={variable.key}
                type={smoothLines ? "monotone" : "linear"}
                dataKey={variable.key} 
                stroke={variable.color} 
                fill={variable.color} 
                fillOpacity={fillOpacity[0] / 100} 
                strokeWidth={strokeWidth[0]}
                name={variable.label}
                animationDuration={animationSpeed[0]}
              />
            ))}
          </AreaChart>
        );
    }
  }, [chartData, chartType, filteredVariables, theme, showGrid, smoothLines, fillOpacity, strokeWidth, animationSpeed, customTooltip]);

  // Componente de seleção de variáveis (multiselect)
  const VariableMultiSelect = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="h-9 gap-2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 border-blue-200 dark:border-blue-800"
        >
          <Filter className="h-4 w-4" />
          <span>Variáveis ({selectedVariables.length})</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Selecionar Variáveis</span>
          <Badge variant="secondary">{selectedVariables.length} selecionadas</Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Grupos de variáveis */}
        {Object.entries(VARIABLE_GROUPS).map(([groupKey, group]) => (
          <div key={groupKey}>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="cursor-pointer"
              onClick={() => toggleGroup(groupKey)}
            >
              <div className="flex items-center gap-3 w-full">
                <span className="text-lg">{group.icon}</span>
                <span className="font-medium flex-1">{group.label}</span>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", group.color)}
                >
                  {FINANCIAL_VARIABLES.filter(v => v.group === groupKey && selectedVariables.includes(v.key)).length}/
                  {FINANCIAL_VARIABLES.filter(v => v.group === groupKey).length}
                </Badge>
              </div>
            </DropdownMenuItem>
            
            {/* Variáveis do grupo */}
            {FINANCIAL_VARIABLES
              .filter(variable => variable.group === groupKey)
              .map((variable) => (
                <DropdownMenuCheckboxItem
                  key={variable.key}
                  checked={selectedVariables.includes(variable.key)}
                  onCheckedChange={() => toggleVariable(variable.key)}
                  onSelect={(e) => e.preventDefault()}
                  className="pl-8"
                >
                  <div className="flex items-center gap-2 w-full">
                    <div 
                      className="w-3 h-3 rounded-full border-2 border-white shadow-sm" 
                      style={{ backgroundColor: variable.color }}
                    />
                    <span className="text-sm">{variable.label}</span>
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
            
            <DropdownMenuSeparator />
          </div>
        ))}
        
        {/* Ações rápidas */}
        <div className="p-2 space-y-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start h-8"
            onClick={() => setSelectedVariables(FINANCIAL_VARIABLES.map(v => v.key))}
          >
            Selecionar Todas
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start h-8"
            onClick={() => setSelectedVariables([])}
          >
            Limpar Seleção
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      {/* Gráfico Principal */}
      <div className={cn("w-full", className)} ref={chartRef}>
        <GlassCard 
          variant="light" 
          elevation="medium"
          className="min-h-[500px] overflow-hidden"
        >
          <div className="p-4 space-y-4">
            {/* Header com controles */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  {title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {filteredVariables.length} variáveis selecionadas • {chartData.length} períodos
                </p>
              </div>
              
              {/* Controles principais */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Tipo de gráfico */}
                <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <Button
                    size="sm"
                    variant={chartType === "area" ? "default" : "ghost"}
                    onClick={() => setChartType("area")}
                    className="h-8 px-3"
                  >
                    Área
                  </Button>
                  <Button
                    size="sm"
                    variant={chartType === "line" ? "default" : "ghost"}
                    onClick={() => setChartType("line")}
                    className="h-8 px-3"
                  >
                    Linha
                  </Button>
                  <Button
                    size="sm"
                    variant={chartType === "bar" ? "default" : "ghost"}
                    onClick={() => setChartType("bar")}
                    className="h-8 px-3"
                  >
                    Barra
                  </Button>
                </div>
                
                {/* Seletor de variáveis */}
                <VariableMultiSelect />
                
               
                
                {/* Expandir */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExpanded(true)}
                  className="h-9 gap-2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 border-blue-200 dark:border-blue-800"
                >
                  <Maximize2 className="h-4 w-4" />
            
                </Button>
              </div>
            </div>
            
            {/* Variáveis selecionadas - badges compactos */}
            {selectedVariables.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {filteredVariables.slice(0, 6).map((variable) => (
                  <Badge
                    key={variable.key}
                    variant="secondary"
                    className={cn(
                      "gap-2 text-xs py-1 px-2",
                      VARIABLE_GROUPS[variable.group as keyof typeof VARIABLE_GROUPS].color
                    )}
                  >
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: variable.color }}
                    />
                    {variable.label}
                  </Badge>
                ))}
                {selectedVariables.length > 6 && (
                  <Badge variant="outline" className="text-xs">
                    +{selectedVariables.length - 6} mais
                  </Badge>
                )}
              </div>
            )}
            
            {/* Dica de zoom */}
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <MousePointer2 className="h-3 w-3" />
              <span>Dica: Use Ctrl + Scroll para zoom • Zoom atual: {Math.round(zoomLevel * 100)}%</span>
            </div>
            
            {/* Container do gráfico com zoom */}
            <div 
              ref={chartContainerRef}
              className="w-full h-[400px] relative overflow-hidden rounded-lg"
              style={{ 
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center',
                transition: 'transform 0.2s ease-out'
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
              </ResponsiveContainer>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Modal Expandido com Configurações Avançadas */}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-7xl h-[95vh] p-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              {title} - Visualização Avançada
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto p-6 pt-4">
            {/* Controles Avançados */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              {/* Tipo de Gráfico */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Tipo de Visualização</Label>
                <div className="flex flex-col gap-2">
                  <Button
                    variant={chartType === "area" ? "default" : "outline"}
                    onClick={() => setChartType("area")}
                    className="justify-start"
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    Gráfico de Área
                  </Button>
                  <Button
                    variant={chartType === "line" ? "default" : "outline"}
                    onClick={() => setChartType("line")}
                    className="justify-start"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Gráfico de Linha
                  </Button>
                  <Button
                    variant={chartType === "bar" ? "default" : "outline"}
                    onClick={() => setChartType("bar")}
                    className="justify-start"
                  >
                    <Grid className="h-4 w-4 mr-2" />
                    Gráfico de Barra
                  </Button>
                </div>
              </div>
              
              {/* Configurações Visuais */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Configurações Visuais</Label>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-grid" className="text-sm">Grade de Fundo</Label>
                  <Switch
                    id="show-grid"
                    checked={showGrid}
                    onCheckedChange={setShowGrid}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="smooth-lines" className="text-sm">Linhas Suaves</Label>
                  <Switch
                    id="smooth-lines"
                    checked={smoothLines}
                    onCheckedChange={setSmoothLines}
                  />
                </div>
                
                {chartType === "area" && (
                  <div className="space-y-2">
                    <Label className="text-sm">Opacidade do Preenchimento: {fillOpacity[0]}%</Label>
                    <Slider
                      value={fillOpacity}
                      onValueChange={setFillOpacity}
                      max={100}
                      min={10}
                      step={10}
                      className="w-full"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label className="text-sm">Espessura da Linha: {strokeWidth[0]}px</Label>
                  <Slider
                    value={strokeWidth}
                    onValueChange={setStrokeWidth}
                    max={6}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
              
              {/* Controles de Zoom */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Controles de Zoom</Label>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.2))}
                    className="flex-1"
                  >
                    <ZoomIn className="h-4 w-4 mr-2" />
                    Zoom +
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.2))}
                    className="flex-1"
                  >
                    <ZoomOut className="h-4 w-4 mr-2" />
                    Zoom -
                  </Button>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoomLevel(1)}
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Resetar Zoom
                </Button>
                
                <div className="text-xs text-center text-gray-500">
                  Zoom atual: {Math.round(zoomLevel * 100)}%
                </div>
              </div>
              
              {/* Animação */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Animação</Label>
                
                <div className="space-y-2">
                  <Label className="text-sm">Velocidade: {animationSpeed[0]}ms</Label>
                  <Slider
                    value={animationSpeed}
                    onValueChange={setAnimationSpeed}
                    max={2000}
                    min={200}
                    step={200}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            
            {/* Seletor de Variáveis Expandido */}
            <div className="mb-6">
              <VariableMultiSelect />
            </div>
            
            {/* Gráfico Expandido */}
            <div 
              className="w-full h-[500px] bg-white dark:bg-gray-800 rounded-lg p-4"
              style={{ 
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center',
                transition: 'transform 0.2s ease-out'
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
              </ResponsiveContainer>
            </div>
            
        
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 
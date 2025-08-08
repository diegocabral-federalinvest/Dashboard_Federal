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
  
  // Séries básicas que podem aparecer nos dados
  { key: 'receitas', label: 'Receitas', color: '#16a34a', group: 'receitaBruta', icon: '💚' },
  { key: 'despesas', label: 'Despesas', color: '#2563eb', group: 'receitaLiquida', icon: '💸' },
  { key: 'lucro', label: 'Lucro', color: '#dc2626', group: 'resultadoLiquido', icon: '💰' },
  
  // Séries de operação adicionais
  { key: 'operacao', label: 'Operação', color: '#065f46', group: 'operacao', icon: '⚙️' },
  { key: 'fator', label: 'Fator', color: '#0891b2', group: 'operacao', icon: '📊' },
  { key: 'advalores', label: 'Advalores', color: '#0e7490', group: 'operacao', icon: '📈' },
  { key: 'iof', label: 'IOF', color: '#0f766e', group: 'operacao', icon: '🏦' },
  
  // Séries de despesas adicionais
  { key: 'despesasFixas', label: 'Despesas Fixas', color: '#1e40af', group: 'receitaLiquida', icon: '🏗️' },
  { key: 'despesasVariaveis', label: 'Despesas Variáveis', color: '#1d4ed8', group: 'receitaLiquida', icon: '📈' },
  
  // Séries de resultado adicionais
  { key: 'resultadoOperacional', label: 'Resultado Operacional', color: '#7c2d12', group: 'resultadoBruto', icon: '⚙️' },
  { key: 'margem', label: 'Margem (%)', color: '#b91c1c', group: 'resultadoLiquido', icon: '📊' },
  
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
  outros: { 
    label: 'Outras Séries', 
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100',
    borderColor: 'border-gray-200 dark:border-gray-800',
    icon: '❓'
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
    // CORREÇÃO: Não gerar dados de exemplo quando não há dados reais
    // Retornar array vazio para permitir renderização de estado "sem dados"
    if (!data || data.length === 0) {
      return [] as any[];
    }

    return data;
  }, [data]);

  // Detectar dinamicamente todas as variáveis disponíveis nos dados reais
  const availableVariables = useMemo(() => {
    const knownVariables = [...FINANCIAL_VARIABLES];
    
    if (!chartData || chartData.length === 0) {
      return knownVariables;
    }
    
    // Extrair todas as chaves únicas dos dados reais
    const dataKeys = new Set<string>();
    chartData.forEach(dataPoint => {
      if (dataPoint && typeof dataPoint === 'object') {
        Object.keys(dataPoint).forEach(key => {
          // Excluir campos que não são séries (period, timestamps, etc.)
          if (key !== 'period' && key !== 'timestamp' && key !== 'date' && key !== 'id') {
            dataKeys.add(key);
          }
        });
      }
    });
    
    // Adicionar variáveis desconhecidas com configuração padrão
    const unknownKeys = Array.from(dataKeys).filter(key => 
      !knownVariables.some(v => v.key === key)
    );
    
    const unknownVariables = unknownKeys.map(key => ({
      key,
      label: `${key.charAt(0).toUpperCase()}${key.slice(1)}`, // Capitalizar primeira letra
      color: '#6b7280', // Cor cinza padrão
      group: 'outros' as const,
      icon: '❓'
    }));
    
    // Combinar variáveis conhecidas com desconhecidas
    return [...knownVariables, ...unknownVariables];
  }, [chartData]);

  // Filtrar variáveis selecionadas
  const filteredVariables = useMemo(() => {
    return availableVariables.filter(variable => 
      selectedVariables.includes(variable.key)
    );
  }, [selectedVariables, availableVariables]);

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
    const groupVariables = availableVariables
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
  }, [selectedVariables, availableVariables]);

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
  const renderChart = useCallback((isExpandedChart = false) => {
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

  // Render helper para estado vazio
  const renderEmptyState = () => (
    <div className="w-full h-[400px] flex items-center justify-center">
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        Nenhum dado para os filtros selecionados
      </div>
    </div>
  );

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
                  {availableVariables.filter(v => v.group === groupKey && selectedVariables.includes(v.key)).length}/
                  {availableVariables.filter(v => v.group === groupKey).length}
                </Badge>
              </div>
            </DropdownMenuItem>
            
            {/* Variáveis do grupo */}
            {availableVariables
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
            onClick={() => setSelectedVariables(availableVariables.map(v => v.key))}
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
    <div className={cn("space-y-4", className)}>
      <GlassCard>
        <div className="p-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
            <div>
              <h3 className="text-base font-semibold tracking-tight">{title}</h3>
              <p className="text-xs text-muted-foreground">
                {/* Remover contagem de períodos se não houver dados */}
                {filteredVariables.length} variáveis selecionadas{chartData.length > 0 ? ` • ${chartData.length} períodos` : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <VariableMultiSelect />
            </div>
          </div>

          {chartData.length === 0 ? (
            renderEmptyState()
          ) : (
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
          )}
        </div>
      </GlassCard>

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
            {chartData.length === 0 ? (
              renderEmptyState()
            ) : (
              <div className="w-full h-[70vh]">
                <ResponsiveContainer width="100%" height="100%">
                  {renderChart(true)}
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
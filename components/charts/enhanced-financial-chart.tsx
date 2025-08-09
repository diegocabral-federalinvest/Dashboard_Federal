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
  FileText, Settings, TrendingUp, MousePointer2, Move3D,
  BarChart3, LineChart as LineChartIcon, AreaChart as AreaChartIcon
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
  year?: number;
  data?: any[];
  periodType?: string;
  currentPeriod?: {
    year?: number;
    month?: number;
    quarter?: number;
    periodType?: string;
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
  { key: 'deducaoFiscal', label: 'Dedução Fiscal', color: '#0ea5a3', group: 'operacao', icon: '⚡' },
  
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
  { key: 'resultadoOperacional', label: 'Resultado Bruto', color: '#7c3aed', group: 'resultadoBruto', icon: '📋' },
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
  year, 
  data, 
  periodType, 
  currentPeriod,
  showMetricsSummary, 
  enableAllVariables, 
  title, 
  className
}: EnhancedFinancialChartProps) {
  // Estados principais
  const [isExpanded, setIsExpanded] = useState(false);
  const [chartType, setChartType] = useState<"line" | "bar" | "area">("area");
  const [selectedVariables, setSelectedVariables] = useState<string[]>(['operacao', 'totalValorFator', 'totalValorAdValorem', 'totalValorTarifas', 'totalPIS', 'totalCOFINS', 'totalISSQN', 'totalEntries', 'totalExpenses', 'receitaBruta', 'receitaLiquida', 'resultadoBruto', 'resultadoLiquido', 'deduction', 'csll', 'irpj']);
  
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
  const [isExpandedModalOpen, setIsExpandedModalOpen] = useState(false);

  // Ano resolvido - usar currentPeriod.year se disponível, senão year, senão 2024
  const resolvedYear = useMemo(() => {
    const yearFromCurrentPeriod = currentPeriod?.year;
    const yearFromProp = year;
    
    if (typeof yearFromCurrentPeriod === 'number' && !Number.isNaN(yearFromCurrentPeriod)) {
      return yearFromCurrentPeriod;
    }
    if (typeof yearFromProp === 'number' && !Number.isNaN(yearFromProp)) {
      return yearFromProp;
    }
    return 2024;
  }, [year, currentPeriod?.year]);

  // Título dinâmico baseado no modo
  const dynamicTitle = useMemo(() => {
    if (title) return title; // Se título foi passado como prop, usar ele
    
    const isMonthly = periodType === 'monthly';
    const isQuarterly = periodType === 'quarterly';
    const month = currentPeriod?.month;
    const quarter = currentPeriod?.quarter;
    
    if (isMonthly && month) {
      const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      return `Operação por Dia - ${monthNames[month - 1]}/${resolvedYear}`;
    } else if (isQuarterly) {
      if (quarter && quarter !== 0) {
        return `Operação Q${quarter}/${resolvedYear}`;
      } else {
        return `Operação por Trimestre - ${resolvedYear}`;
      }
    } else {
      return `Operação por Mês - ${resolvedYear}`;
    }
  }, [title, periodType, currentPeriod?.month, currentPeriod?.quarter, resolvedYear]);

  // Carregar dados da API de operação mensal
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setErr(null);
    
    // Detectar modo de visualização
    const isMonthly = periodType === 'monthly';
    const isQuarterly = periodType === 'quarterly';
    const month = currentPeriod?.month;
    const quarter = currentPeriod?.quarter;
    
    console.log(`🔍 [CHART-DEBUG] Props recebidos:`, { 
      year, 
      currentPeriod, 
      periodType,
      yearFromCurrentPeriod: currentPeriod?.year,
      resolvedYear,
      isMonthly,
      isQuarterly,
      month,
      quarter
    });
    
    // Construir URL da API baseado no modo
    let apiUrl = `/api/reports/operation?year=${resolvedYear}`;
    if (isMonthly && month) {
      // Modo mensal: visualização diária
      apiUrl += `&monthly=true&month=${month}`;
    } else if (isQuarterly) {
      // Modo trimestral
      apiUrl += `&quarterly=true`;
      if (quarter && quarter !== 0) { // 0 significa "todos"
        apiUrl += `&quarter=${quarter}`;
      }
    }
    // Modo anual usa apenas year (padrão)
    
    console.log(`🔍 [CHART-DEBUG] URL da API: ${apiUrl}`);
    
    fetch(apiUrl, { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const json = await res.json();
        console.log(`🔍 [CHART-DEBUG] Resposta da API:`, json);
        
        if (active) {
          const data = Array.isArray(json.data) ? json.data : [];
          console.log(`🔍 [CHART-DEBUG] Dados processados:`, data);
          setChartData(data);
        }
      })
      .catch((e) => {
        console.error(`🔍 [CHART-DEBUG] Erro ao carregar dados:`, e);
        active && setErr(e?.message || 'Erro ao carregar');
      })
      .finally(() => active && setLoading(false));
    return () => { active = false };
  }, [resolvedYear, year, currentPeriod, periodType]);

  // Variáveis disponíveis - 4 verdes + 3 roxas
  const availableVariables = useMemo(() => {
    return [
      // Grupo Verde - Operação e Valores
      { 
        key: 'operacao', 
        label: 'Operação', 
        color: '#065f46', // Verde mais escuro (base)
        group: 'operacao', 
        icon: '⚙️' 
      },
      { 
        key: 'totalValorFator', 
        label: 'Valor Fator', 
        color: '#047857', // Verde escuro
        group: 'valores', 
        icon: '📊' 
      },
      { 
        key: 'totalValorAdValorem', 
        label: 'Ad Valorem', 
        color: '#059669', // Verde médio
        group: 'valores', 
        icon: '📈' 
      },
      { 
        key: 'totalValorTarifas', 
        label: 'Tarifas', 
        color: '#10b981', // Verde claro
        group: 'valores', 
        icon: '💰' 
      },
      // Grupo Roxo - Impostos
      { 
        key: 'totalPIS', 
        label: 'PIS', 
        color: '#581c87', // Roxo mais escuro
        group: 'impostos', 
        icon: '🏛️' 
      },
      { 
        key: 'totalCOFINS', 
        label: 'COFINS', 
        color: '#7c3aed', // Roxo médio
        group: 'impostos', 
        icon: '📋' 
      },
      { 
        key: 'totalISSQN', 
        label: 'ISSQN', 
        color: '#a855f7', // Roxo claro
        group: 'impostos', 
        icon: '🏢' 
      },
      // Grupo Financeiro - Entradas/Despesas
      { 
        key: 'totalEntries', 
        label: 'Entradas', 
        color: '#16a34a', // Verde
        group: 'financeiro', 
        icon: '💰' 
      },
      { 
        key: 'totalExpenses', 
        label: 'Despesas', 
        color: '#dc2626', // Vermelho
        group: 'financeiro', 
        icon: '💸' 
      },
      // Grupo Azul - Resultados DRE
      { 
        key: 'receitaBruta', 
        label: 'Receita Bruta', 
        color: '#1e3a8a', // Azul mais escuro
        group: 'resultados', 
        icon: '📊' 
      },
      { 
        key: 'receitaLiquida', 
        label: 'Receita Líquida', 
        color: '#3b82f6', // Azul médio escuro
        group: 'resultados', 
        icon: '💧' 
      },
      { 
        key: 'resultadoBruto', 
        label: 'Resultado Bruto', 
        color: '#60a5fa', // Azul médio claro
        group: 'resultados', 
        icon: '📈' 
      },
      { 
        key: 'resultadoLiquido', 
        label: 'Resultado Líquido', 
        color: '#93c5fd', // Azul mais claro
        group: 'resultados', 
        icon: '✨' 
      },
      // Grupo Laranja - Impostos e Deduções Manuais
      { 
        key: 'deduction', 
        label: 'Dedução Fiscal', 
        color: '#ea580c', // Laranja escuro
        group: 'manuais', 
        icon: '📉' 
      },
      { 
        key: 'csll', 
        label: 'CSLL', 
        color: '#fb923c', // Laranja médio
        group: 'manuais', 
        icon: '🏛️' 
      },
      { 
        key: 'irpj', 
        label: 'IRPJ', 
        color: '#fdba74', // Laranja claro
        group: 'manuais', 
        icon: '📊' 
      }
    ];
  }, []);

  // Filtrar variáveis selecionadas
  const filteredVariables = useMemo(() => {
    const filtered = availableVariables.filter(variable => 
      selectedVariables.includes(variable.key)
    );
    
    // Debug detalhado das variáveis
    console.log(`🔍 [CHART-DEBUG] Variáveis filtradas:`, filtered.map(v => v.key));
    console.log(`🔍 [CHART-DEBUG] Total variáveis selecionadas:`, selectedVariables.length);
    console.log(`🔍 [CHART-DEBUG] Dados do primeiro ponto:`, chartData[0]);
    
    // Verificar se todas as variáveis estão nos dados
    if (chartData.length > 0) {
      const dataKeys = Object.keys(chartData[0]);
      const missingVariables = selectedVariables.filter(key => !dataKeys.includes(key));
      const availableInData = selectedVariables.filter(key => dataKeys.includes(key));
      
      console.log(`🔍 [DATA-DEBUG] Variáveis disponíveis nos dados:`, availableInData.length);
      console.log(`🔍 [DATA-DEBUG] Variáveis faltando nos dados:`, missingVariables);
      console.log(`🔍 [DATA-DEBUG] Todas as chaves nos dados:`, dataKeys);
    }
    
    return filtered;
  }, [selectedVariables, availableVariables, chartData]);

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
      // Debug do payload
      console.log(`🔍 [TOOLTIP-DEBUG] Payload completo:`, payload);
      console.log(`🔍 [TOOLTIP-DEBUG] Total de variáveis no tooltip:`, payload.length);
      
      // Filtrar apenas variáveis com valores numéricos válidos
      const validPayload = payload.filter((entry: any) => 
        entry.value !== undefined && 
        entry.value !== null && 
        !isNaN(Number(entry.value))
      );
      
      return (
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 min-w-[280px] max-h-[400px] overflow-y-auto">
          <p className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100 border-b pb-2">{label}</p>
          <div className="space-y-1.5">
            {validPayload
              .sort((a: any, b: any) => Math.abs(b.value) - Math.abs(a.value))
              .map((entry: any, index: number) => (
                <div key={index} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div 
                      className="w-3 h-3 rounded-full shadow-sm flex-shrink-0" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                      {entry.name}:
                    </span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-gray-100 flex-shrink-0">
                    {entry.name === 'Margem (%)' 
                      ? `${Number(entry.value).toFixed(1)}%` 
                      : formatCurrency(Number(entry.value))
                    }
                  </span>
                </div>
              ))}
          </div>
          <div className="mt-3 pt-2 border-t text-xs text-gray-500">
            Total: {validPayload.length} variáveis
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
      const periodDescription = `Dados Anuais - ${resolvedYear}`;

      const exportOptions = {
        filename: `federal-invest-${
          periodType === 'monthly' ? 'daily' : 
          periodType === 'quarterly' ? 'quarterly' : 'annual'
        }-${resolvedYear}`,
        title: dynamicTitle,
        subtitle: `${periodDescription}`,
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
  }, [chartRef, dynamicTitle, resolvedYear, theme, toast, periodType]);

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

    // Componente de seleção de variáveis - todas as 4 variáveis
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
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>Selecionar Variáveis</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Todas as variáveis disponíveis */}
        {availableVariables.map((variable) => (
                <DropdownMenuCheckboxItem
                  key={variable.key}
                  checked={selectedVariables.includes(variable.key)}
            onCheckedChange={(checked) => {
              if (checked) {
                setSelectedVariables(prev => [...prev, variable.key]);
              } else {
                setSelectedVariables(prev => prev.filter(v => v !== variable.key));
              }
            }}
                  onSelect={(e) => e.preventDefault()}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div 
                      className="w-3 h-3 rounded-full border-2 border-white shadow-sm" 
                      style={{ backgroundColor: variable.color }}
                    />
              <span className="text-sm">{variable.icon} {variable.label}</span>
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
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
              <h3 className="text-base font-semibold tracking-tight">{dynamicTitle}</h3>
              <p className="text-xs text-muted-foreground">
                {periodType === 'monthly' && currentPeriod?.month
                  ? `Dias do mês ${currentPeriod.month}/${resolvedYear}`
                  : periodType === 'quarterly' 
                    ? (currentPeriod?.quarter && currentPeriod.quarter !== 0 
                        ? `Trimestre ${currentPeriod.quarter}` 
                        : 'Todos os Trimestres')
                    : `Ano ${resolvedYear}`
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              <VariableMultiSelect />
              <div className="flex items-center gap-2">
                <Button 
                  variant={chartType === 'bar' ? 'default' : 'outline'} 
                  className="h-9"
                  onClick={() => setChartType('bar')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" /> Barras
                </Button>
                <Button 
                  variant={chartType === 'area' ? 'default' : 'outline'} 
                  className="h-9"
                  onClick={() => setChartType('area')}
                >
                  <AreaChartIcon className="h-4 w-4 mr-2" /> Área
                </Button>
              </div>
              <Button variant="outline" className="h-9" onClick={() => setIsExpandedModalOpen(true)}>
                <Maximize2 className="h-4 w-4 mr-2" /> Expandir
              </Button>
            </div>
          </div>

          {/* Debug: Mostrar dados brutos 
          {chartData.length > 0 && (
            <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs">
              <strong>🔍 DEBUG - Dados recebidos:</strong>
              <pre className="mt-2 overflow-auto max-h-32">
                {JSON.stringify(chartData.slice(0, 3), null, 2)}
              </pre>
              <div className="mt-2">
                <strong>Total de pontos:</strong> {chartData.length}
                <br />
                <strong>Variáveis selecionadas:</strong> {selectedVariables.join(', ')}
                <br />
                <strong>Variáveis filtradas:</strong> {filteredVariables.map(v => v.key).join(', ')}
              </div>
            </div>
          )}*/}

          {loading ? (
            <div className="w-full h-[400px] flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">Carregando...</div>
          ) : err ? (
            <div className="w-full h-[400px] flex items-center justify-center text-sm text-red-500">{err}</div>
          ) : chartData.length === 0 ? (
            renderEmptyState()
          ) : filteredVariables.length === 0 ? (
            <div className="w-full h-[400px] flex items-center justify-center text-sm text-orange-500">
              Nenhuma variável selecionada. Selecione &quot;Operação&quot; no dropdown.
            </div>
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
      <Dialog open={isExpandedModalOpen} onOpenChange={setIsExpandedModalOpen}>
        <DialogContent className="max-w-7xl h-[95vh] p-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              {dynamicTitle} - Visualização Avançada
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
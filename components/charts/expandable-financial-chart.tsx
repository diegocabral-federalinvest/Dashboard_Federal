"use client";

import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Maximize2, Download, Filter, Eye, EyeOff } from "lucide-react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface ExpandableFinancialChartProps {
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
}

// Definir todas as variáveis financeiras disponíveis
const FINANCIAL_VARIABLES = [
  // Operação
  { key: 'valorFator', label: 'Valor Fator', color: '#10b981', group: 'operacao' },
  { key: 'valorAdvalorem', label: 'Valor Advalorem', color: '#059669', group: 'operacao' },
  { key: 'valorTarifas', label: 'Valor Tarifas', color: '#047857', group: 'operacao' },
  { key: 'deducao', label: 'Dedução', color: '#0d9488', group: 'operacao' },
  
  // Receita Bruta
  { key: 'receitaBruta', label: 'Receita Bruta', color: '#22c55e', group: 'receitaBruta' },
  { key: 'pis', label: 'PIS', color: '#16a34a', group: 'receitaBruta' },
  { key: 'cofins', label: 'COFINS', color: '#15803d', group: 'receitaBruta' },
  { key: 'issqn', label: 'ISSQN', color: '#166534', group: 'receitaBruta' },
  
  // Receita Líquida
  { key: 'receitaLiquida', label: 'Receita Líquida', color: '#3b82f6', group: 'receitaLiquida' },
  { key: 'despesasTributaveis', label: 'Despesas Tributáveis', color: '#1d4ed8', group: 'receitaLiquida' },
  { key: 'despesasNaoTributaveis', label: 'Despesas Não Tributáveis', color: '#1e40af', group: 'receitaLiquida' },
  
  // Resultado Bruto
  { key: 'resultadoBruto', label: 'Resultado Bruto', color: '#8b5cf6', group: 'resultadoBruto' },
  { key: 'csll', label: 'CSLL', color: '#7c3aed', group: 'resultadoBruto' },
  { key: 'irpj', label: 'IRPJ', color: '#6d28d9', group: 'resultadoBruto' },
  
  // Entradas
  { key: 'entradas', label: 'Entradas', color: '#f59e0b', group: 'entradas' },
  
  // Resultado Líquido
  { key: 'resultadoLiquido', label: 'Resultado Líquido', color: '#ef4444', group: 'resultadoLiquido' },
];

const GROUPS = {
  operacao: { label: 'Operação', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' },
  receitaBruta: { label: 'Receita Bruta', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100' },
  receitaLiquida: { label: 'Receita Líquida', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' },
  resultadoBruto: { label: 'Resultado Bruto', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100' },
  entradas: { label: 'Entradas', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' },
  resultadoLiquido: { label: 'Resultado Líquido', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' },
};

export function ExpandableFinancialChart({ 
  data, 
  periodType, 
  currentPeriod,
  showMetricsSummary = true,
  enableAllVariables = false
}: ExpandableFinancialChartProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [chartType, setChartType] = useState<"line" | "bar" | "area">("area");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedVariables, setSelectedVariables] = useState<string[]>(
    enableAllVariables 
      ? ['valorFator', 'receitaBruta', 'receitaLiquida', 'resultadoBruto', 'entradas', 'resultadoLiquido'] 
      : ['valorFator', 'receitaBruta', 'resultadoLiquido']
  );
  const { theme } = useTheme();

  // Processar dados para o gráfico
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      // Gerar dados de exemplo mais completos
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

      if (periodType === "monthly") {
        for (let i = 5; i >= 0; i--) {
          const month = currentMonth - i;
          const adjustedMonth = month <= 0 ? month + 12 : month;
          const year = month <= 0 ? currentYear - 1 : currentYear;
          
          exampleData.push({
            period: `${adjustedMonth.toString().padStart(2, '0')}/${year}`,
            ...generateFinancialData(),
          });
        }
      } else if (periodType === "quarterly") {
        for (let i = 3; i >= 0; i--) {
          const quarter = currentQuarter - i;
          const adjustedQuarter = quarter <= 0 ? quarter + 4 : quarter;
          const year = quarter <= 0 ? currentYear - 1 : currentYear;
          
          exampleData.push({
            period: `Q${adjustedQuarter}/${year}`,
            ...generateFinancialData(),
          });
        }
      } else {
        for (let i = 2; i >= 0; i--) {
          const year = currentYear - i;
          
          exampleData.push({
            period: `${year}`,
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
  const toggleVariable = (variableKey: string) => {
    setSelectedVariables(prev => {
      if (prev.includes(variableKey)) {
        return prev.filter(key => key !== variableKey);
      } else {
        return [...prev, variableKey];
      }
    });
  };

  // Toggle de grupo
  const toggleGroup = (groupKey: string) => {
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
  };

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="capitalize">{entry.name}:</span>
              <span className="font-medium">{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    const commonAxisProps = {
      stroke: theme === "dark" ? "#4b5563" : "#9ca3af",
      fontSize: 12
    };

    switch (chartType) {
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#374151" : "#e5e7eb"} />
            <XAxis dataKey="period" {...commonAxisProps} />
            <YAxis {...commonAxisProps} />
            <Tooltip content={customTooltip} />
            <Legend />
            {filteredVariables.map((variable) => (
              <Bar 
                key={variable.key}
                dataKey={variable.key} 
                fill={variable.color}
                name={variable.label}
              />
            ))}
          </BarChart>
        );
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#374151" : "#e5e7eb"} />
            <XAxis dataKey="period" {...commonAxisProps} />
            <YAxis {...commonAxisProps} />
            <Tooltip content={customTooltip} />
            <Legend />
            {filteredVariables.map((variable) => (
              <Line 
                key={variable.key}
                type="monotone" 
                dataKey={variable.key} 
                stroke={variable.color} 
                strokeWidth={2}
                name={variable.label}
              />
            ))}
          </LineChart>
        );
      default: // area
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#374151" : "#e5e7eb"} />
            <XAxis dataKey="period" {...commonAxisProps} />
            <YAxis {...commonAxisProps} />
            <Tooltip content={customTooltip} />
            <Legend />
            {filteredVariables.map((variable) => (
              <Area 
                key={variable.key}
                type="monotone" 
                dataKey={variable.key} 
                stroke={variable.color} 
                fill={variable.color} 
                fillOpacity={0.3} 
                strokeWidth={2}
                name={variable.label}
              />
            ))}
          </AreaChart>
        );
    }
  };

  const ChartContainer = ({ height = "100%", className = "" }: { height?: string | number, className?: string }) => (
    <ResponsiveContainer width="100%" height={height} className={className}>
      {renderChart()}
    </ResponsiveContainer>
  );

  return (
    <>
      {/* Controles */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={chartType === "area" ? "default" : "outline"}
            onClick={() => setChartType("area")}
          >
            Área
          </Button>
          <Button
            size="sm"
            variant={chartType === "line" ? "default" : "outline"}
            onClick={() => setChartType("line")}
          >
            Linha
          </Button>
          <Button
            size="sm"
            variant={chartType === "bar" ? "default" : "outline"}
            onClick={() => setChartType("bar")}
          >
            Barra
          </Button>
        </div>
        
        <div className="flex gap-2">
          {enableAllVariables && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros ({selectedVariables.length})
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(true)}
          >
            <Maximize2 className="h-4 w-4 mr-2" />
            Expandir
          </Button>
        </div>
      </div>

      {/* Painel de Filtros */}
      {enableAllVariables && showFilters && (
        <Card className="p-4 mb-4 bg-gray-50 dark:bg-gray-800">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Variáveis Selecionadas</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(GROUPS).map(([groupKey, group]) => (
                  <Button
                    key={groupKey}
                    variant="outline"
                    size="sm"
                    onClick={() => toggleGroup(groupKey)}
                    className="text-xs"
                  >
                    {group.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {FINANCIAL_VARIABLES.map((variable) => (
                <div key={variable.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={variable.key}
                    checked={selectedVariables.includes(variable.key)}
                    onCheckedChange={() => toggleVariable(variable.key)}
                  />
                  <label
                    htmlFor={variable.key}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                  >
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: variable.color }}
                    />
                    {variable.label}
                  </label>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {filteredVariables.map((variable) => (
                <Badge
                  key={variable.key}
                  variant="secondary"
                  className={cn(
                    "gap-1",
                    GROUPS[variable.group as keyof typeof GROUPS].color
                  )}
                >
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: variable.color }}
                  />
                  {variable.label}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Gráfico */}
      <ChartContainer height={350} />

      {/* Modal Expandido */}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Evolução Financeira Detalhada</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            {/* Controles Expandidos */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <div className="flex gap-2">
                <Button
                  variant={chartType === "area" ? "default" : "outline"}
                  onClick={() => setChartType("area")}
                >
                  Gráfico de Área
                </Button>
                <Button
                  variant={chartType === "line" ? "default" : "outline"}
                  onClick={() => setChartType("line")}
                >
                  Gráfico de Linha
                </Button>
                <Button
                  variant={chartType === "bar" ? "default" : "outline"}
                  onClick={() => setChartType("bar")}
                >
                  Gráfico de Barra
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Filter className="h-4 w-4" />
                  {showFilters ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  Filtros
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>

            {/* Painel de Filtros no Modal */}
            {showFilters && (
              <Card className="p-4 mb-6 bg-gray-50 dark:bg-gray-800">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Selecionar Variáveis</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(GROUPS).map(([groupKey, group]) => (
                        <Button
                          key={groupKey}
                          variant="outline"
                          size="sm"
                          onClick={() => toggleGroup(groupKey)}
                          className="text-xs"
                        >
                          {group.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {FINANCIAL_VARIABLES.map((variable) => (
                      <div key={variable.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`modal-${variable.key}`}
                          checked={selectedVariables.includes(variable.key)}
                          onCheckedChange={() => toggleVariable(variable.key)}
                        />
                        <label
                          htmlFor={`modal-${variable.key}`}
                          className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2"
                        >
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: variable.color }}
                          />
                          {variable.label}
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {filteredVariables.map((variable) => (
                      <Badge
                        key={variable.key}
                        variant="secondary"
                        className={cn(
                          "gap-1",
                          GROUPS[variable.group as keyof typeof GROUPS].color
                        )}
                      >
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: variable.color }}
                        />
                        {variable.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Gráfico Expandido */}
            <ChartContainer height={600} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 
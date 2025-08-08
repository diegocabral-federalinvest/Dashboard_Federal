"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
  ReferenceLine,
  Legend
} from "recharts";
import { Calendar, RotateCcw, TrendingUp, Wallet, PiggyBank, Filter, Users } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

import { formatCurrency, formatDate, calculateInvestmentReturns, generateChartData } from "../_helpers";
import { ChartDataPoint, Investment } from "../_types";
import { CHART_COLORS, ANIMATION_VARIANTS } from "../_constants";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";


interface EnhancedChartProps {
  data: ChartDataPoint[];
  investments: Investment[];
  investors: Array<{ id: string; name: string; }>;
  isLoading?: boolean;
  height?: number;
  showSlider?: boolean;
  showLegend?: boolean;
}

export const EnhancedChart: React.FC<EnhancedChartProps> = ({
  data,
  investments,
  investors,
  isLoading = false,
  height = 400,
  showSlider = false,
  showLegend = false
}) => {
  const [dateRange, setDateRange] = useState<[number, number]>([0, 100]);

  // Filtros avançados
  const [selectedInvestor, setSelectedInvestor] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRange | undefined>(undefined);

  // Filtrar dados baseado nos filtros aplicados (CORRIGIDO com logs de debug)
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }
    
    let filteredInvestments = [...investments];
    
    // CORREÇÃO PRINCIPAL: Filtro por investidor com recálculo dos dados
    if (selectedInvestor !== "all") {
      filteredInvestments = investments.filter(inv => inv.investorId === selectedInvestor);
      
      if (filteredInvestments.length === 0) {
        return [];
      }
      
      // Recalcular dados do gráfico para apenas esse investidor
      const calculations = calculateInvestmentReturns(filteredInvestments);
      const recalculatedData = generateChartData(calculations);
      
      // Usar dados recalculados em vez dos originais
      let filtered = [...recalculatedData];
      
      // Filtro por período de datas (nos dados recalculados)
      if (dateRangeFilter?.from && dateRangeFilter?.to) {
        filtered = filtered.filter(item => {
          const itemDate = new Date(item.date);
          const inRange = itemDate >= dateRangeFilter.from! && itemDate <= dateRangeFilter.to!;
          return inRange;
        });
      }
      
      // Filtro do slider (aplicado por último)
      if (filtered.length > 0) {
        const startIndex = Math.floor((dateRange[0] / 100) * filtered.length);
        const endIndex = Math.ceil((dateRange[1] / 100) * filtered.length);
        filtered = filtered.slice(startIndex, endIndex);
      }
      
      return filtered;
    }
    
    // Caso padrão: todos os investidores
    let filtered = [...data];
    
    // Filtro por período de datas
    if (dateRangeFilter?.from && dateRangeFilter?.to) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date);
        const inRange = itemDate >= dateRangeFilter.from! && itemDate <= dateRangeFilter.to!;
        return inRange;
      });
    }
    
    // Filtro do slider (aplicado por último)
    if (filtered.length > 0) {
      const startIndex = Math.floor((dateRange[0] / 100) * filtered.length);
      const endIndex = Math.ceil((dateRange[1] / 100) * filtered.length);
      filtered = filtered.slice(startIndex, endIndex);
    }
    
    return filtered;
  }, [data, dateRange, selectedInvestor, dateRangeFilter, investments]);

  // Informações do range atual
  const currentRange = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return null;
    
    return {
      start: formatDate(filteredData[0].date, "dd/MM/yyyy"),
      end: formatDate(filteredData[filteredData.length - 1].date, "dd/MM/yyyy"),
      count: filteredData.length
    };
  }, [filteredData]);

  // Tooltip customizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white dark:bg-gray-800 p-4 border rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">
          {formatDate(label, "dd/MM/yyyy")}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div 
              className="w-3 h-3 rounded" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {entry.name}:
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const resetRange = () => setDateRange([0, 100]);
  
  const resetFilters = () => {
    setSelectedInvestor("all");
    setDateRangeFilter(undefined);
    setDateRange([0, 100]);
  };
  
  const hasActiveFilters = selectedInvestor !== "all" || dateRangeFilter !== undefined;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Nenhum dado disponível
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={ANIMATION_VARIANTS.fadeIn.initial}
      animate={ANIMATION_VARIANTS.fadeIn.animate}
      transition={ANIMATION_VARIANTS.fadeIn.transition}
    >
      {/* Controles de Filtros Avançados */}
      <Card className="border border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5 text-purple-600" />
            Filtros do Gráfico
            {hasActiveFilters && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                Filtros Ativos
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro por Investidor */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4 text-purple-600" />
                Investidor
              </Label>
              <Select 
                value={selectedInvestor} 
                onValueChange={(value) => {
                  setSelectedInvestor(value);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecionar investidor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">📊 Todos os Investidores</SelectItem>
                  {investors.map((investor) => (
                    <SelectItem key={investor.id} value={investor.id}>
                      👤 {investor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por Período - Inputs Simples */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4 text-purple-600" />
                Período
              </Label>
              <div className="grid grid-cols-2 gap-1">
                <Input 
                  type="date" 
                  value={dateRangeFilter?.from ? format(dateRangeFilter.from, "yyyy-MM-dd") : ""}
                  onChange={(e) => {
                    const newDate = e.target.value ? new Date(e.target.value) : undefined;
                    setDateRangeFilter(prev => ({ 
                      from: newDate,
                      to: prev?.to 
                    }));
                  }}
                  className="text-xs h-8"
                  placeholder="Data inicial"
                />
                <Input 
                  type="date" 
                  value={dateRangeFilter?.to ? format(dateRangeFilter.to, "yyyy-MM-dd") : ""}
                  onChange={(e) => {
                    const newDate = e.target.value ? new Date(e.target.value) : undefined;
                    setDateRangeFilter(prev => ({ 
                      from: prev?.from,
                      to: newDate 
                    }));
                  }}
                  className="text-xs h-8"
                  placeholder="Data final"
                />
              </div>
              {/* Botões rápidos */}
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date();
                    const thirtyDaysAgo = addDays(today, -30);
                    setDateRangeFilter({ from: thirtyDaysAgo, to: today });
                  }}
                  className="flex-1 text-xs h-6 px-2"
                >
                  30d
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date();
                    const ninetyDaysAgo = addDays(today, -90);
                    setDateRangeFilter({ from: ninetyDaysAgo, to: today });
                  }}
                  className="flex-1 text-xs h-6 px-2"
                >
                  90d
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRangeFilter(undefined)}
                  className="flex-1 text-xs h-6 px-2"
                >
                  Limpar
                </Button>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="space-y-2">
              <Label className="text-sm font-medium opacity-0">Ações</Label>
              <div className="flex gap-2">
                {hasActiveFilters && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={resetFilters}
                    className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-100"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Limpar
                  </Button>
                )}
                <Badge variant="outline" className="flex-1 justify-center py-2 bg-white/80">
                  {filteredData.length} pontos
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico Principal com as 3 Variáveis:
          1. Total Aportado (Verde) - Capital investido pelos investidores
          2. Total de Rendimento (Amarelo) - Rendimento acumulado ao longo do tempo
          3. Saldo Atual (Azul) - Soma do Total Aportado + Total de Rendimento
      */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={height}>
            <ComposedChart data={filteredData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
              <defs>
                {/* Gradientes para as áreas */}
                <linearGradient id="totalAportadoGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="rendimentoGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="saldoTotalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid 
                strokeDasharray="3 3" 
                className="opacity-30"
                horizontal={true}
                vertical={false}
              />
              
              <XAxis 
                dataKey="date"
                tickFormatter={(value) => formatDate(value, "dd/MM/yy")}
                fontSize={12}
                className="text-gray-600 dark:text-gray-400"
                interval="preserveStartEnd"
                angle={-45}
                textAnchor="end"
                height={70}
              />
              
              <YAxis 
                tickFormatter={(value) => {
                  if (value >= 1000000) {
                    return `${(value / 1000000).toFixed(1)}M`;
                  } else if (value >= 1000) {
                    return `${(value / 1000).toFixed(0)}k`;
                  }
                  return value.toString();
                }}
                fontSize={12}
                className="text-gray-600 dark:text-gray-400"
                domain={[0, 'dataMax + 10%']}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              {/* Legenda sempre visível e melhorada */}
              <Legend 
                wrapperStyle={{ paddingTop: '20px', paddingBottom: '10px' }}
                iconType="line"
                formatter={(value) => {
                  switch(value) {
                    case 'Total Aportado':
                      return <span style={{ color: '#10B981', fontWeight: 'bold' }}>💰 Total Aportado</span>;
                    case 'Total de Rendimento':
                      return <span style={{ color: '#F59E0B', fontWeight: 'bold' }}>📈 Total de Rendimento</span>;
                    case 'Saldo Atual':
                      return <span style={{ color: '#1D4ED8', fontWeight: 'bold' }}>💎 Saldo Atual</span>;
                    default:
                      return value;
                  }
                }}
              />

              {/* Área do Total Aportado - Verde */}
              <Area
                type="monotone"
                dataKey="totalAportado"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#totalAportadoGradient)"
                fillOpacity={0.6}
                name="Total Aportado"
                dot={false}
              />

              {/* Área do Rendimento Acumulado - Amarelo */}
              <Area
                type="monotone"
                dataKey="totalRendimento"
                stroke="#F59E0B"
                strokeWidth={2}
                fill="url(#rendimentoGradient)"
                fillOpacity={0.6}
                name="Total de Rendimento"
                dot={false}
              />

              {/* Linha do Saldo Total (Aportado + Rendimento) - Azul - Renderizada por último para ficar visível */}
              <Line
                type="monotone"
                dataKey="saldoTotal"
                stroke="#1D4ED8"
                strokeWidth={5}
                dot={false}
                name="Saldo Atual"
                strokeDasharray="0"
                style={{ 
                  filter: 'drop-shadow(0px 2px 4px rgba(29, 78, 216, 0.8))',
                  zIndex: 1000
                }}
              />

              {/* Linha de Break-even */}
              {filteredData.length > 0 && (
                <ReferenceLine 
                  y={Math.max(...filteredData.map(d => d.totalAportado))} 
                  stroke="#6B7280" 
                  strokeDasharray="5 5" 
                  label={{
                    value: "Break-even",
                    position: "insideTopRight",
                    fontSize: 12,
                    fill: "#6B7280"
                  }}
                />
                              )}
              </ComposedChart>
            </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Slider de Filtro Melhorado */}
      {showSlider && data.length > 10 && (
        <Card className="border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <Label className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Filtro de Período
                  </Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {currentRange?.count || 0} de {data.length} registros
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={resetRange}
                    className="h-8 text-xs border-blue-300 hover:bg-blue-100"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Resetar
                  </Button>
                </div>
              </div>
              
              <div className="relative px-3">
                <Slider
                  value={dateRange}
                  onValueChange={(value) => setDateRange(value as [number, number])}
                  max={100}
                  step={1}
                  className="w-full [&>span[role=slider]]:cursor-pointer [&>span[role=slider]]:border-2 [&>span[role=slider]]:border-blue-500 [&>span[role=slider]]:bg-white [&>span[role=slider]]:shadow-lg [&>span[role=slider]]:w-5 [&>span[role=slider]]:h-5 [&>span[role=slider]]:hover:scale-110 [&>span[role=slider]]:transition-transform [&>span:first-child]:bg-blue-200 dark:[&>span:first-child]:bg-blue-800 [&>span:last-child]:bg-gradient-to-r [&>span:last-child]:from-blue-500 [&>span:last-child]:to-indigo-500"
                />
                
                {/* Labels das datas */}
                {currentRange && (
                  <div className="flex justify-between mt-3 text-xs text-blue-700 dark:text-blue-300">
                    <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-700">
                      📅 {currentRange.start}
                    </span>
                    <span className="text-blue-500 font-medium">até</span>
                    <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-700">
                      📅 {currentRange.end}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cards de Métricas Rápidas */}
      {filteredData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                  <Wallet className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Total Aportado
                  </p>
                  <p className="text-lg font-bold text-green-900 dark:text-green-100">
                    {formatCurrency(filteredData[filteredData.length - 1]?.totalAportado || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Total de Rendimento
                  </p>
                  <p className="text-lg font-bold text-amber-900 dark:text-amber-100">
                    {formatCurrency(filteredData[filteredData.length - 1]?.totalRendimento || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <PiggyBank className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Saldo Atual
                  </p>
                  <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                    {formatCurrency(filteredData[filteredData.length - 1]?.saldoTotal || 0)}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    (Aportado + Rendimento)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  );
}; 
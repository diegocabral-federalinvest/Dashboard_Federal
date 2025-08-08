"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Table, Download, Calculator } from "lucide-react";
import { DRETable, getTableDataForExport } from "./_components/dre-table";
import { DREChart } from "./_components/dre-chart";
import { useHeaderContent } from "@/hooks/use-header-content";
import { SummaryMetrics } from "./_components/summary-metrics";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDREFinancialData } from "@/hooks/use-financial-data";
import { useUploadCSV } from "@/features/finance/api/use-upload-csv";
import { useExportData } from "./_hooks/use-export-data";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { transformDataForChart, chartOptions } from "./utils";
import { ExportCard, ExportChart } from "@/lib/services/advanced-export-service";
import { ActionTooltip } from "@/components/ui/financial-tooltip";

// Dynamic imports para melhorar a performance
const DynamicCSVUpload = dynamic(() => import("./_components/csv-upload").then(mod => ({ default: mod.CSVUpload })), { ssr: false });
const DynamicAdvancedExportDialog = dynamic(() => import("./_components/advanced-export-dialog").then(mod => ({ default: mod.AdvancedExportDialog })), { ssr: false });
import { container, item, availableYears, months, quarters } from "./_constants";

export default function DREClientRefactored() {
  // Usar o hook unificado para dados do DRE
  const {
    data: effectiveData,
    isLoading,
    error,
    period: currentPeriod,
    periodLabel,
    setPeriodType,
    setYear,
    setMonth,
    setQuarter,
    updateTaxDeduction: updateTaxDeductionHook,
    refetch
  } = useDREFinancialData();

  // Estados locais
  const [localState, setLocalState] = useState({
    year: currentPeriod.year,
    quarter: currentPeriod.quarter || 1,
    month: currentPeriod.month || 1,
    deducaoFiscal: currentPeriod.deducaoFiscal || 0
  });
  
  const [taxDeductionDialog, setTaxDeductionDialog] = useState(false);
  const [isDetailedViewOpen, setIsDetailedViewOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isCSVUploadOpen, setIsCSVUploadOpen] = useState(false);
  const [isUploadingCSV, setIsUploadingCSV] = useState(false);
  const [csvUploadError, setCsvUploadError] = useState<string | null>(null);
  
  // Estado para controlar a aba ativa
  const [activeTab, setActiveTab] = useState(() => {
    switch (currentPeriod.periodType) {
      case "monthly": return "mensal";
      case "quarterly": return "trimestral";
      case "annual": return "anual";
      default: return "trimestral";
    }
  });

  const { toast } = useToast();

  // Utilidades de exportação
  const { 
    isExporting, 
    exportToCSV, 
    exportToExcel, 
    exportToPDF,
    exportToAdvancedPDF,
    exportToAdvancedPNG
  } = useExportData({
    getTableData: (isDetailed = false) => 
      effectiveData ? getTableDataForExport(effectiveData, isDetailed) : []
  });

  // Transform data for the chart
  const chartData = useMemo(() => transformDataForChart(effectiveData), [effectiveData]);

  // Preparar dados para exportação avançada
  const prepareExportCards = useMemo((): ExportCard[] => {
    if (!effectiveData) return [];

    return [
      {
        title: "Receita Total",
        value: formatCurrency(effectiveData.receitas.total),
        description: "Soma de todas as receitas do período",
        trend: effectiveData.receitas.total >= 0 ? 'up' : 'down',
        trendValue: effectiveData.receitas.total >= 0 ? "Positivo" : "Negativo",
        color: 'blue'
      },
      {
        title: "Despesas Totais", 
        value: formatCurrency(effectiveData.despesas.total),
        description: "Soma de todas as despesas do período",
        trend: effectiveData.despesas.total <= 0 ? 'up' : 'down',
        trendValue: effectiveData.despesas.total <= 0 ? "Controlado" : "Alto",
        color: 'red'
      },
      {
        title: "Resultado Bruto",
        value: formatCurrency(effectiveData.resultadoBruto),
        description: "Receitas menos custos operacionais",
        trend: effectiveData.resultadoBruto >= 0 ? 'up' : 'down',
        trendValue: `${effectiveData.resultadoBruto >= 0 ? '+' : ''}${((effectiveData.resultadoBruto / effectiveData.receitas.total) * 100).toFixed(1)}%`,
        color: effectiveData.resultadoBruto >= 0 ? 'green' : 'red'
      },
      {
        title: "Resultado Líquido",
        value: formatCurrency(effectiveData.resultadoLiquido),
        description: "Resultado final após impostos",
        trend: effectiveData.resultadoLiquido >= 0 ? 'up' : 'down',
        trendValue: `${effectiveData.resultadoLiquido >= 0 ? '+' : ''}${((effectiveData.resultadoLiquido / effectiveData.receitas.total) * 100).toFixed(1)}%`,
        color: effectiveData.resultadoLiquido >= 0 ? 'green' : 'red'
      }
    ];
  }, [effectiveData]);

  const prepareExportChart = useMemo((): ExportChart | undefined => {
    if (!chartData?.evolucaoReceita) return undefined;

    return {
      title: "Evolução dos Resultados",
      data: chartData.evolucaoReceita,
      type: 'bar',
      height: 400
    };
  }, [chartData]);

  // Hook para upload de CSV
  const { mutate: uploadCSV, isPending: isUploading } = useUploadCSV({
    onSuccess: () => {
      setIsCSVUploadOpen(false);
      refetch();
    },
    onError: (error) => {
      setCsvUploadError(error.message);
    }
  });

  // Impostos estimados (para o período trimestral)
  const estimatedTaxes = useMemo(() => {
    if (!effectiveData) return undefined;
    
    return {
      irpj: effectiveData.impostos.ir,
      csll: effectiveData.impostos.csll
    };
  }, [effectiveData]);

  // Tax savings calculation
  const taxSavings = useMemo(() => {
    if (!estimatedTaxes || localState.deducaoFiscal <= 0) return 0;
    
    // With deduction for quarterly periods
    const noDeductionIRPJ = Math.max(0, (estimatedTaxes.irpj + localState.deducaoFiscal) * 0.15);
    const noDeductionCSLL = Math.max(0, (estimatedTaxes.csll + localState.deducaoFiscal) * 0.09);
    
    return Math.max(0, (noDeductionIRPJ - estimatedTaxes.irpj) + (noDeductionCSLL - estimatedTaxes.csll));
  }, [estimatedTaxes, localState.deducaoFiscal]);

  // Configurar header
  useHeaderContent({
    title: "Demonstrativo de Resultados",
    subtitle: periodLabel,
    pageType: 'dre',
    showDefaultActions: false
  });

  // Update local state when effectiveData changes
  useEffect(() => {
    if (effectiveData) {
      setLocalState(prev => ({
        ...prev,
        deducaoFiscal: effectiveData.deducaoFiscal || 0
      }));
    }
  }, [effectiveData]);

  // Sync local state with period changes
  useEffect(() => {
    setLocalState(prev => ({
      ...prev,
      year: currentPeriod.year,
      quarter: currentPeriod.quarter || 1,
      month: currentPeriod.month || 1
    }));
  }, [currentPeriod]);

  // HANDLERS

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    switch (value) {
      case "mensal":
        setPeriodType("monthly");
        break;
      case "trimestral":
        setPeriodType("quarterly");
        break;
      case "anual":
        setPeriodType("annual");
        break;
    }
  };

  const handleExport = () => {
    setIsExportDialogOpen(true);
  };

  const handleTableExport = (isDetailed: boolean) => {
    const periodSuffix = currentPeriod.periodType === 'quarterly' && currentPeriod.quarter 
      ? `Q${currentPeriod.quarter}_${currentPeriod.year}` 
      : `${currentPeriod.periodType}_${currentPeriod.year}`;
    const fileName = `DRE_${isDetailed ? 'Detalhado' : 'Resumido'}_${periodSuffix}`;
    exportToExcel({
      fileName,
      title: `DRE ${isDetailed ? 'Detalhado' : 'Resumido'}`
    });
  };

  // Handlers de exportação avançada
  const handleAdvancedPDF = async () => {
    const periodSuffix = currentPeriod.periodType === 'quarterly' && currentPeriod.quarter 
      ? `Q${currentPeriod.quarter}_${currentPeriod.year}` 
      : `${currentPeriod.periodType}_${currentPeriod.year}`;
    const fileName = `DRE_Avancado_${periodSuffix}`;
    
    try {
      await exportToAdvancedPDF({
        fileName,
        title: "Demonstrativo de Resultados do Exercício",
        subtitle: "Relatório Financeiro Profissional",
        period: periodLabel,
        cards: prepareExportCards,
        chart: prepareExportChart,
        additionalInfo: `Dados gerados automaticamente pelo sistema Federal Invest. ${effectiveData?.deducaoFiscal ? `Dedução fiscal aplicada: ${formatCurrency(effectiveData.deducaoFiscal)}` : ''}`
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive"
      });
    }
    
    setIsExportDialogOpen(false);
  };

  const handleAdvancedPNG = async () => {
    const periodSuffix = currentPeriod.periodType === 'quarterly' && currentPeriod.quarter 
      ? `Q${currentPeriod.quarter}_${currentPeriod.year}` 
      : `${currentPeriod.periodType}_${currentPeriod.year}`;
    const fileName = `DRE_Imagem_${periodSuffix}`;
    
    try {
      await exportToAdvancedPNG({
        fileName,
        title: "Demonstrativo de Resultados do Exercício",
        subtitle: "Relatório Financeiro Profissional",
        period: periodLabel,
        cards: prepareExportCards,
        chart: prepareExportChart,
        additionalInfo: `Dados gerados automaticamente pelo sistema Federal Invest. ${effectiveData?.deducaoFiscal ? `Dedução fiscal aplicada: ${formatCurrency(effectiveData.deducaoFiscal)}` : ''}`
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível gerar a imagem. Tente novamente.",
        variant: "destructive"
      });
    }
    
    setIsExportDialogOpen(false);
  };

  const handleSimplePDF = () => {
    const periodSuffix = currentPeriod.periodType === 'quarterly' && currentPeriod.quarter 
      ? `Q${currentPeriod.quarter}_${currentPeriod.year}` 
      : `${currentPeriod.periodType}_${currentPeriod.year}`;
    const fileName = `DRE_Simples_${periodSuffix}`;
    
    try {
      exportToPDF({
        fileName,
        title: "Demonstrativo de Resultados do Exercício",
        additionalInfo: `Período: ${periodLabel}`
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive"
      });
    }
    
    setIsExportDialogOpen(false);
  };

  const handleExcel = () => {
    const periodSuffix = currentPeriod.periodType === 'quarterly' && currentPeriod.quarter 
      ? `Q${currentPeriod.quarter}_${currentPeriod.year}` 
      : `${currentPeriod.periodType}_${currentPeriod.year}`;
    const fileName = `DRE_Excel_${periodSuffix}`;
    
    try {
      exportToExcel({
        fileName,
        title: "DRE"
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível gerar o Excel. Tente novamente.",
        variant: "destructive"
      });
    }
    
    setIsExportDialogOpen(false);
  };

  const handleCSV = () => {
    const periodSuffix = currentPeriod.periodType === 'quarterly' && currentPeriod.quarter 
      ? `Q${currentPeriod.quarter}_${currentPeriod.year}` 
      : `${currentPeriod.periodType}_${currentPeriod.year}`;
    const fileName = `DRE_CSV_${periodSuffix}`;
    
    try {
      exportToCSV({
        fileName
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível gerar o CSV. Tente novamente.",
        variant: "destructive"
      });
    }
    
    setIsExportDialogOpen(false);
  };

  const handleCSVUpload = async (file: File) => {
    setIsUploadingCSV(true);
    setCsvUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await uploadCSV(formData);
      setIsUploadingCSV(false);
    } catch (error) {
      setIsUploadingCSV(false);
      setCsvUploadError((error as Error).message || "Erro ao processar o arquivo.");
    }
  };

  const handleSaveTaxDeduction = async () => {
    try {
      await updateTaxDeductionHook(localState.deducaoFiscal);
      
      toast({
        title: "Dedução fiscal salva",
        description: "A página será atualizada automaticamente para refletir as mudanças."
      });
      
      setTaxDeductionDialog(false);
      
      // Aguardar um pouco para o toast aparecer antes do reload
      setTimeout(() => {
        // Dar refresh automático na página para garantir que todos os dados sejam atualizados
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error("Erro ao salvar dedução fiscal:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar a dedução fiscal. Tente novamente.",
        variant: "destructive"
      });
    }
  };


  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-3 p-2 md:p-4 pb-8 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 min-h-screen"
    >
      {/* Top Navigation */}
      <div className="space-y-2">
        <div className="flex flex-col lg:flex-row gap-2 items-start lg:items-center lg:justify-between">
          {/* Abas de navegação principal */}
          <div className="bg-white/95 dark:bg-gray-900/90 p-2 rounded-lg shadow-lg backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 w-fit">
            <div className="flex gap-2">
              <Link
                href="#"
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'mensal' 
                    ? 'bg-gray-900 text-white shadow-lg dark:bg-gray-800' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => handleTabChange('mensal')}
              >
                <span className="text-sm font-medium">Mensal</span>
              </Link>
              <Link
                href="#"
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'trimestral' 
                    ? 'bg-gray-900 text-white shadow-lg dark:bg-gray-800' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => handleTabChange('trimestral')}
              >
                <span className="text-sm font-medium">Trimestral</span>
              </Link>
              <Link
                href="#"
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'anual' 
                    ? 'bg-gray-900 text-white shadow-lg dark:bg-gray-800' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => handleTabChange('anual')}
              >
                <span className="text-sm font-medium">Anual</span>
              </Link>
            </div>
          </div>

          {/* Container para seletores e botões */}
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full lg:w-auto lg:flex-1 lg:justify-between">
            {/* Seletores de período */}
            <div className="flex flex-wrap gap-1 items-center">
              {/* Seletor de Ano */}
              <Select value={currentPeriod.year?.toString() || "all"} onValueChange={(value) => setYear(value === "all" ? null : Number(value))}>
                <SelectTrigger className="w-32 bg-white/80 dark:bg-gray-800/80">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Seletor específico baseado no tipo de período */}
              {currentPeriod.periodType === 'monthly' && (
                <Select value={currentPeriod.month?.toString()} onValueChange={(value) => setMonth(Number(value))}>
                  <SelectTrigger className="w-40 bg-white/80 dark:bg-gray-800/80">
                    <SelectValue placeholder="Mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(month => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {currentPeriod.periodType === 'quarterly' && (
                <Select value={currentPeriod.quarter?.toString()} onValueChange={(value) => setQuarter(Number(value))}>
                  <SelectTrigger className="w-52 bg-white/80 dark:bg-gray-800/80">
                    <SelectValue placeholder="Trimestre" />
                  </SelectTrigger>
                  <SelectContent>
                    {quarters.map(quarter => (
                      <SelectItem key={quarter.value} value={quarter.value.toString()}>
                        {quarter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Botões de ações */}
            <div className="flex flex-wrap gap-1">
              {currentPeriod.periodType === 'quarterly' && effectiveData && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTaxDeductionDialog(true)}
                  className="bg-white/80 dark:bg-gray-800/80 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all text-xs"
                >
                  <Calculator className="h-3 w-3 mr-1" />
                  <span>Dedução: {formatCurrency(localState.deducaoFiscal)}</span>
                </Button>
              )}

              <ActionTooltip content="Visualizar dados brutos da importação" variant="info">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => (window.location.href = '/dre/dados-brutos')}
                  className="bg-white/80 dark:bg-gray-800/80 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
                >
                  <Table className="h-3 w-3" />
                </Button>
              </ActionTooltip>

              <ActionTooltip content="Importar dados financeiros via CSV" variant="info">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCSVUploadOpen(true)}
                  className="bg-white/80 dark:bg-gray-800/80 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
                >
                  <Upload className="h-3 w-3" />
                </Button>
              </ActionTooltip>

              <ActionTooltip content="Exportar relatório DRE" variant="success">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="bg-white/80 dark:bg-gray-800/80 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
                >
                  <Download className="h-3 w-3" />
                </Button>
              </ActionTooltip>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* DRE Table (1/3 width) */}
        <motion.div variants={item} className="lg:col-span-1">
          <DRETable 
            data={effectiveData || null} 
            isLoading={isLoading} 
            error={error} 
            periodType={currentPeriod.periodType}
            periodLabel={periodLabel}
            onExport={handleTableExport}
          />
        </motion.div>
        
        {/* Charts Grid (2/3 width) */}
        <motion.div variants={item} className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <DREChart
              title="Evolução dos Resultados"
              data={chartData?.evolucaoReceita || null}
              options={chartOptions}
              isLoading={isLoading}
              error={error}
              type="bar"
              animationIndex={0}
              expandable
            />
            <DREChart
              title="Composição de Receita"
              data={chartData?.receitas || null}
              options={chartOptions}
              isLoading={isLoading}
              error={error}
              type="doughnut"
              animationIndex={1}
              expandable
            />
            <DREChart
              title="Análise de Impostos"
              data={chartData?.impostos || null}
              options={chartOptions}
              isLoading={isLoading}
              error={error}
              type="bar"
              animationIndex={2}
              expandable
            />
            <DREChart
              title="Lucro Percentual"
              data={chartData?.lucroPercentual || null}
              options={chartOptions}
              isLoading={isLoading}
              error={error}
              type="pie"
              animationIndex={3}
              expandable
            />
        </motion.div>
      </div>
      
      {/* KPI Summary Cards */}
      <motion.div variants={item}>
        <SummaryMetrics 
          data={effectiveData} 
          isLoading={isLoading}
          error={error}
        />
      </motion.div>

      {/* Dialog para edição de dedução fiscal */}
      <Dialog open={taxDeductionDialog} onOpenChange={setTaxDeductionDialog}>
        <DialogContent className="sm:max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-blue-200 dark:border-blue-800">
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Dedução Fiscal
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {quarters.find(q => q.value === localState.quarter)?.label} de {localState.year}
              </p>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="deducao" className="text-sm font-medium">
                Valor da dedução fiscal (R$)
              </Label>
              <Input
                id="deducao"
                type="number"
                value={localState.deducaoFiscal}
                onChange={(e) => setLocalState(prev => ({
                  ...prev,
                  deducaoFiscal: Number(e.target.value)
                }))}
                min="0"
                step="0.01"
                placeholder="0,00"
                className="border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Este valor será somado à receita bruta para calcular impostos
              </p>
            </div>
            
            {taxSavings > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Economia estimada de impostos
                  </span>
                </div>
                <div className="text-lg font-bold text-green-800 dark:text-green-200">
                  {formatCurrency(taxSavings)}
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Redução no IRPJ e CSLL com esta dedução
                </p>
              </div>
            )}
            
            <div className="flex justify-end gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setTaxDeductionDialog(false)}
                className="text-gray-600 dark:text-gray-400"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveTaxDeduction}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Salvar Dedução
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para visualização detalhada */}
      <Dialog open={isDetailedViewOpen} onOpenChange={setIsDetailedViewOpen}>
        <DialogContent className="max-w-2xl h-[95vh] max-h-[95vh] overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
          <GlassCard title="DRE Detalhado" variant="dark" elevation="medium">
            <div className="overflow-y-auto max-h-[calc(95vh-130px)] px-0">
              <DRETable 
                data={effectiveData || null} 
                isLoading={isLoading} 
                error={error} 
                isDetailed={true}
                periodType={currentPeriod.periodType}
                onExport={handleTableExport}
              />
            </div>
          </GlassCard>
        </DialogContent>
      </Dialog>
      
      {/* Modal para exportação avançada */}
      {isExportDialogOpen && (
        <DynamicAdvancedExportDialog 
          isOpen={isExportDialogOpen} 
          onClose={() => setIsExportDialogOpen(false)} 
          onExportAdvancedPDF={handleAdvancedPDF}
          onExportAdvancedPNG={handleAdvancedPNG}
          onExportSimplePDF={handleSimplePDF}
          onExportExcel={handleExcel}
          onExportCSV={handleCSV}
          isExporting={isExporting}
        />
      )}
      
      {/* Dialog para upload de CSV */}
      {isCSVUploadOpen && (
        <Dialog open={isCSVUploadOpen} onOpenChange={setIsCSVUploadOpen}>
          <DynamicCSVUpload 
            onUpload={handleCSVUpload}
            isUploading={isUploadingCSV} 
            error={csvUploadError}
            open={isCSVUploadOpen} 
            onOpenChange={(open: boolean) => {
              if (!open && !isUploadingCSV) {
                setIsCSVUploadOpen(false);
              }
            }}
          />
        </Dialog>
      )}
    </motion.div>
  );
} 
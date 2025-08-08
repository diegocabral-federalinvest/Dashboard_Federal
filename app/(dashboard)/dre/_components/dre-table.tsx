"use client";

import React, { useState } from "react";
import { Loader2, Info, Plus, Minus, Maximize2, Download, FileText, FileSpreadsheet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { DREData } from "@/features/finance/api/use-get-dre";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FinancialInfoTooltip } from "@/components/ui/financial-tooltip";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// Interfaces
interface DRETableProps {
  data: DREData | null;
  isLoading: boolean;
  error: Error | null;
  isDetailed?: boolean;
  periodType?: "monthly" | "quarterly" | "annual";
  periodLabel?: string; // Label formatado que vem do hook (ex: "3º Trimestre (Jul-Set) de 2024")
  selectedPeriod?: string; // Fallback para período customizado
  onExport: (isDetailed: boolean) => void;
}

interface DREItem {
  description: string;
  value: number;
  level: number; // 0 for main items, 1 for sub-items
  isHighlighted?: boolean;
  isTotal?: boolean;
  tooltip?: {
    title: string;
    description: string;
    variant?: "default" | "info" | "success" | "warning" | "error";
  };
  operation?: 'plus' | 'minus';
}

interface ExportableRow {
  descricao: string;
  valor: number;
}

// Função para formatar o período (agora usa diretamente o periodLabel do hook)
const formatPeriodLabel = (periodLabel?: string, periodType?: string, selectedPeriod?: string): string => {
  // Priorizar o periodLabel que vem do hook (já formatado corretamente)
  if (periodLabel) {
    return periodLabel;
  }
  
  // Fallback para selectedPeriod customizado
  if (selectedPeriod) {
    return selectedPeriod;
  }
  
  // Fallback básico baseado no tipo
  switch (periodType) {
    case "monthly":
      return "Mensal";
    case "quarterly":
      return "Trimestral";
    case "annual":
      return "Anual";
    default:
      return "Período não especificado";
  }
};

// Tooltips informativos
const getTooltipInfo = (description: string, data: DREData): DREItem['tooltip'] => {
    const tooltips: Record<string, { title: string; description: string; variant?: "info" | "success" | "warning" | "error" }> = {
        "Operação": { title: "Receitas Operacionais", description: "Receitas principais da empresa (vendas, serviços).", variant: "info" },
        "Receita Bruta": { title: "Receita Bruta", description: `Receita total antes de impostos. Calculada como: Operação + Dedução = ${formatCurrency(data.receitas.operacoes + data.deducaoFiscal)}`, variant: "success" },
        "Impostos sobre Receita": { title: "Impostos sobre a Receita", description: "Impostos que incidem diretamente sobre a receita (PIS, COFINS, ISSQN).", variant: "error" },
        "Receita Líquida": { title: "Receita Líquida", description: `Receita após a dedução dos impostos. Receita Bruta - Impostos = ${formatCurrency(data.resultadoBruto)}`, variant: "success" },
        "Despesas Operacionais": { title: "Despesas Operacionais", description: "Total de despesas para manter a operação da empresa.", variant: "error" },
        "Resultado Operacional": { title: "Resultado Operacional", description: `Lucro ou prejuízo das operações principais. Receita Líquida - Despesas = ${formatCurrency(data.resultadoOperacional)}`, variant: "info" },
        "Outras Receitas": { title: "Outras Receitas/Entradas", description: "Receitas não relacionadas à atividade principal.", variant: "info" },
        "Dedução Fiscal": { title: "Dedução Fiscal", description: "Valor de dedução (ex: PIS/COFINS) inserida manualmente.", variant: "warning" },
        "Resultado Líquido": { title: "Resultado Líquido", description: "Lucro ou prejuízo final do período após todas as receitas e despesas." },
      };
  return tooltips[description];
};

// Constrói os itens para a tabela RESUMIDA
const buildSummaryDREItems = (data: DREData | null): DREItem[] => {
  if (!data) return [];
  return [
    { description: "Operação", value: data.receitas.operacoes, level: 0, operation: 'plus', tooltip: getTooltipInfo("Operação", data) },
    { description: "Receita Bruta", value: data.receitas.total, level: 0, isTotal: true, tooltip: getTooltipInfo("Receita Bruta", data) },
    { description: "Receita Líquida", value: data.resultadoBruto, level: 0, isTotal: true, tooltip: getTooltipInfo("Receita Líquida", data) },
    { description: "Despesas", value: data.despesas.total, level: 0, operation: 'minus', tooltip: getTooltipInfo("Despesas Operacionais", data) },
    { description: "Resultado Bruto", value: data.resultadoOperacional, level: 0, isTotal: true, tooltip: getTooltipInfo("Resultado Operacional", data) },
    { description: "Entradas", value: data.receitas.outras, level: 0, operation: 'plus', tooltip: getTooltipInfo("Outras Receitas", data) },
    { description: "Dedução", value: data.deducaoFiscal, level: 0, operation: 'plus', tooltip: getTooltipInfo("Dedução Fiscal", data) },
    { description: "Resultado Líquido", value: data.resultadoLiquido, level: 0, isHighlighted: true, isTotal: true, tooltip: getTooltipInfo("Resultado Líquido", data) },
  ];
};

// Constrói os itens para a tabela DETALHADA
const buildDetailedDREItems = (data: DREData | null): DREItem[] => {
  if (!data) return [];
  return [
    // Receitas detalhadas
    { description: "Operação", value: data.receitas.operacoes, level: 0, operation: 'plus', tooltip: getTooltipInfo("Operação", data) },
    { description: "Valor Fator", value: data.custos.fator, level: 1, operation: 'plus' },
    { description: "Valor Advalorem", value: data.custos.adValorem, level: 1, operation: 'plus' },
    { description: "Valor Tarifas", value: data.custos.tarifas, level: 1, operation: 'plus' },
   
    // Impostos detalhados
    { description: "PIS", value: data.impostos.pis, level: 1, operation: 'minus' },
    { description: "COFINS", value: data.impostos.cofins, level: 1, operation: 'minus' },
    { description: "ISSQN", value: data.impostos.issqn, level: 1, operation: 'minus' },
    { description: "Receita Líquida", value: data.resultadoBruto, level: 0, isTotal: true, tooltip: getTooltipInfo("Receita Líquida", data) },
    // Despesas detalhadas
    { description: "Despesas Tributáveis", value: data.despesas.tributaveis, level: 1, operation: 'minus' },
    { description: "Despesas Não Tributáveis", value: data.despesas.total - data.despesas.tributaveis, level: 1, operation: 'minus' },
    { description: "Resultado Bruto", value: data.resultadoOperacional, level: 0, isTotal: true, tooltip: getTooltipInfo("Resultado Operacional", data) },
    // Impostos sobre resultado
    { description: "CSLL", value: data.impostos.csll, level: 1, operation: 'minus' },
    { description: "IRPJ", value: data.impostos.ir, level: 1, operation: 'minus' },
    // Entradas e resultado final
    { description: "Entradas", value: data.receitas.outras, level: 0, operation: 'plus', tooltip: getTooltipInfo("Outras Receitas", data) },
    { description: "Dedução", value: data.deducaoFiscal, level: 0, operation: 'plus', tooltip: getTooltipInfo("Dedução Fiscal", data) },
    { description: "Receita Bruta", value: data.receitas.total, level: 0, isTotal: true, tooltip: getTooltipInfo("Receita Bruta", data) },
    { description: "Resultado Líquido", value: data.resultadoLiquido, level: 0, isHighlighted: true, isTotal: true, tooltip: getTooltipInfo("Resultado Líquido", data) },
  ];
};

// Função para exportar dados
export const getTableDataForExport = (data: DREData, isDetailed: boolean): ExportableRow[] => {
  const items = isDetailed ? buildDetailedDREItems(data) : buildSummaryDREItems(data);
  return items.map(item => ({
    descricao: `${' '.repeat(item.level * 2)}${item.description}`,
    valor: item.value
  }));
};

// Função para exportar para CSV
const exportToCSV = (data: DREData, isDetailed: boolean, periodLabel?: string, periodType?: string, selectedPeriod?: string) => {
  const items = getTableDataForExport(data, isDetailed);
  const formattedPeriodLabel = formatPeriodLabel(periodLabel, periodType, selectedPeriod);
  
  const csvContent = [
    'Descrição,Valor',
    ...items.map(item => `"${item.descricao}","${item.valor}"`)
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `DRE_${isDetailed ? 'Detalhado' : 'Resumido'}_${formattedPeriodLabel.replace(/\s+/g, '_')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Função para exportar para PDF - DESIGN MODERNO E OTIMIZADO
const exportToPDF = async (data: DREData, isDetailed: boolean, periodLabel?: string, periodType?: string, selectedPeriod?: string) => {
  const items = getTableDataForExport(data, isDetailed);
  const formattedPeriodLabel = formatPeriodLabel(periodLabel, periodType, selectedPeriod);
  
  try {
    // Importa jsPDF dinamicamente
    const { jsPDF } = await import('jspdf');
    require('jspdf-autotable');
    
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    
    // CORES MODERNAS - AZUIS MAIS ESCUROS
    const darkBlue = [15, 23, 42] as const;      // slate-900 - azul bem escuro
    const mediumBlue = [30, 41, 59] as const;     // slate-800 - azul médio
    const accentBlue = [59, 130, 246] as const;   // blue-500 - azul de destaque
    const lightGray = [248, 250, 252] as const;   // slate-50 - cinza claro
    const white = [255, 255, 255] as const;       // branco
    const green = [34, 197, 94] as const;         // green-500 - verde para positivos
    const red = [239, 68, 68] as const;           // red-500 - vermelho para negativos
    const amber = [245, 158, 11] as const;        // amber-500 - âmbar para destaques
    
    // ===== CABEÇALHO MODERNO E COMPACTO =====
    
    // Fundo gradiente para o cabeçalho (simulado com retângulo)
    doc.setFillColor(...darkBlue);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    // Título principal
    doc.setTextColor(...white);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('DEMONSTRATIVO DE RESULTADOS', pageWidth / 2, 15, { align: 'center' });
    
    // Período com destaque
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${isDetailed ? 'Detalhado' : 'Resumido'} • ${formattedPeriodLabel}`, pageWidth / 2, 25, { align: 'center' });
    
    // Linha decorativa sutil
    doc.setDrawColor(...accentBlue);
    doc.setLineWidth(1);
    doc.line(30, 30, pageWidth - 30, 30);
    
    // ===== TABELA OTIMIZADA PARA UMA PÁGINA =====
    
    // Calcular altura disponível para a tabela
    const headerHeight = 40;
    const footerHeight = 25;
    const availableHeight = pageHeight - headerHeight - footerHeight;
    
    // Calcular altura dinâmica das linhas baseado no número de itens - OTIMIZADO PARA SINGLE PAGE
    const maxRows = items.length;
    const tableHeaderHeight = 20; // Altura do cabeçalho da tabela
    const safetyMargin = 10; // Margem de segurança
    const usableTableHeight = availableHeight - tableHeaderHeight - safetyMargin;
    
    // Calcular altura mínima necessária para caber tudo em uma página
    const dynamicRowHeight = Math.max(4, Math.min(10, usableTableHeight / maxRows));
    
    console.log(`PDF Single Page Config: ${maxRows} rows, ${usableTableHeight}px available, ${dynamicRowHeight}px per row`);
    
    // Preparar dados para a tabela
    const tableData = items.map(item => [
      item.descricao,
      formatCurrency(item.valor)
    ]);
    
    // Configurar a tabela com design moderno - FORÇAR SINGLE PAGE
    (doc as any).autoTable({
      body: tableData, // Sem cabeçalho da tabela
      startY: 38, // Começar logo após o header compacto
      theme: 'plain',
      tableWidth: 'auto',
      margin: { top: 38, bottom: footerHeight },
      
      // Sem cabeçalho da tabela - removido
      
      // ESTILOS DO CORPO - OTIMIZADO PARA SINGLE PAGE
      bodyStyles: {
        fontSize: Math.max(7, Math.min(9, dynamicRowHeight - 1)), // Fonte menor para caber melhor
        textColor: [15, 23, 42], // Texto preto/escuro para todo o corpo
        cellPadding: { 
          top: Math.max(1, dynamicRowHeight / 4), 
          right: 8, 
          bottom: Math.max(1, dynamicRowHeight / 4), 
          left: 8 
        },
        lineWidth: 0.2,
        lineColor: [203, 213, 225], // gray-300 - linhas mais visíveis
        minCellHeight: dynamicRowHeight, // Altura fixa das células
      },
      
      // ESTILOS DAS COLUNAS - OTIMIZADO PARA SINGLE PAGE
      columnStyles: {
        0: { 
          cellWidth: 130,
          fontSize: Math.max(7, Math.min(9, dynamicRowHeight - 1)),
          textColor: [15, 23, 42],
          minCellHeight: dynamicRowHeight
        },
        1: { 
          cellWidth: 50, 
          halign: 'right',
          fontSize: Math.max(7, Math.min(9, dynamicRowHeight - 1)),
          fontStyle: 'bold',
          textColor: [15, 23, 42],
          minCellHeight: dynamicRowHeight
        }
      },
      
      // ESTILOS GERAIS - OTIMIZADO PARA SINGLE PAGE
      styles: {
        overflow: 'linebreak',
        cellPadding: 3, // Padding menor
        fontSize: Math.max(7, Math.min(9, dynamicRowHeight - 1)),
        textColor: [15, 23, 42],
        lineColor: [203, 213, 225],
        lineWidth: 0.2,
        minCellHeight: dynamicRowHeight, // Altura consistente
        valign: 'middle' // Alinhamento vertical centralizado
      },
      
      // FORÇAR SINGLE PAGE - CONFIGURAÇÕES CRÍTICAS
      pageBreak: 'avoid',
      rowPageBreak: 'avoid',
      tableLineColor: [203, 213, 225],
      tableLineWidth: 0.3,
      
      // Configurações para garantir que tudo fique em uma página
      showHead: 'never', // Não mostrar cabeçalho
      useCss: false,
      
      // Callback para garantir que não quebre página
      didDrawPage: function(data: any) {
        // Se a tabela for maior que uma página, reduzir ainda mais o tamanho da fonte
        if (data.pageNumber > 1) {
          console.warn('Tabela quebrou página - ajustando...');
        }
      },
      
      // CUSTOMIZAÇÃO AVANÇADA DAS CÉLULAS
      didParseCell: function(data: any) {
        const cellText = data.cell.text[0] || '';
        
        // Resultado Líquido - Destaque especial com gradiente
        if (cellText.includes('Resultado Líquido')) {
          data.cell.styles.fillColor = [30, 41, 59]; // mediumBlue mais suave
          data.cell.styles.textColor = white;
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fontSize = Math.max(8, Math.min(10, dynamicRowHeight));
          data.cell.styles.minCellHeight = dynamicRowHeight;
        }
        
        // Totais importantes - fundo sutil
        else if (cellText.includes('Receita Bruta') || 
                 cellText.includes('Receita Líquida') ||
                 cellText.includes('Resultado Bruto')) {
          data.cell.styles.fillColor = [248, 250, 252]; // slate-50
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = [15, 23, 42]; // texto escuro
        }
        
        // Sub-itens (level 1) - Estilo diferenciado mais sutil
        else if (cellText.startsWith('  ')) {
          data.cell.styles.fillColor = [251, 252, 253]; // gray-25
          data.cell.styles.textColor = [51, 65, 85]; // slate-700
          data.cell.styles.fontStyle = 'normal';
        }
        
        // Linhas alternadas para melhor legibilidade
        else if (data.row.index % 2 === 0) {
          data.cell.styles.fillColor = [248, 250, 252]; // slate-50
        }
        
        // Manter todos os valores em preto, sem cores especiais
        data.cell.styles.textColor = data.cell.styles.textColor || [15, 23, 42];
      }
    });
    
    // ===== RODAPÉ ELEGANTE E MINIMALISTA =====
    
    const now = new Date();
    const footerText = `Gerado em ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}`;
    
    // Linha decorativa sutil no rodapé
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(40, pageHeight - 18, pageWidth - 40, pageHeight - 18);
    
    // Texto do rodapé centralizado
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    // Marca d'água discreta
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7);
    doc.text('Federal Invest', pageWidth - 25, pageHeight - 5, { align: 'right' });
    
    // Baixar o arquivo
    const fileName = `DRE_${isDetailed ? 'Detalhado' : 'Resumido'}_${formattedPeriodLabel.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
    
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    // Fallback para método de impressão se jsPDF não estiver disponível
    exportToPDFfallback(data, isDetailed, periodLabel, periodType, selectedPeriod);
  }
};

// Função de fallback para PDF (método de impressão original)
const exportToPDFfallback = (data: DREData, isDetailed: boolean, periodLabel?: string, periodType?: string, selectedPeriod?: string) => {
  const items = getTableDataForExport(data, isDetailed);
  const formattedPeriodLabel = formatPeriodLabel(periodLabel, periodType, selectedPeriod);
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>DRE ${isDetailed ? 'Detalhado' : 'Resumido'}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .table { width: 100%; border-collapse: collapse; }
        .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .table th { background-color: #f2f2f2; font-weight: bold; }
        .table tr:nth-child(even) { background-color: #f9f9f9; }
        .level-1 { padding-left: 20px; }
        .total { font-weight: bold; background-color: #e8f4f8; }
        .highlighted { background-color: #fff3cd; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Demonstrativo de Resultados do Exercício</h1>
        <h2>${isDetailed ? 'Detalhado' : 'Resumido'}</h2>
        <p>Período: ${formattedPeriodLabel}</p>
      </div>
      <table class="table">
       
        <tbody>
          ${items.map(item => `
            <tr class="${item.descricao.includes('Resultado Líquido') ? 'highlighted' : ''}">
              <td>${item.descricao}</td>
              <td>${formatCurrency(item.valor)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }
};

// Componentes de estado
const LoadingState = () => <Card className="h-64 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></Card>;
const ErrorState = () => <Card className="h-64 flex items-center justify-center text-red-500">Erro ao carregar dados.</Card>;

// Componente da Linha da Tabela com melhor padding
const TableRow: React.FC<{ item: DREItem; isModal?: boolean }> = ({ item, isModal = false }) => {
  const isNegative = item.value < 0;
  const valueColor = isNegative ? "text-red-500" : "text-foreground";

  return (
    <div
      className={`grid grid-cols-3 py-4 ${isModal ? 'px-6' : 'px-4'} border-b last:border-b-0 hover:bg-muted/20 transition-colors ${
        item.isHighlighted ? 'bg-blue-50 dark:bg-blue-950/20 font-semibold' : ''
      } ${item.isTotal ? 'font-bold' : ''}`}
    >
      <div className="flex items-center gap-2 col-span-2">
        <span 
          style={{ paddingLeft: `${item.level * (isModal ? 2 : 1.5)}rem` }} 
          className={`${isModal ? 'text-base' : 'text-sm'}`}
        >
          {item.description}
        </span>
        {item.tooltip && (
          <FinancialInfoTooltip 
            title={item.tooltip.title} 
            description={item.tooltip.description} 
            value={formatCurrency(item.value)} 
            variant={item.tooltip.variant || "info"}
            side="right"
          >
            <Info className="h-4 w-4 text-blue-500 cursor-help" />
          </FinancialInfoTooltip>
        )}
      </div>
      <div className="flex items-center justify-end gap-2">
        {item.operation && (
          <Badge variant={item.operation === 'plus' ? 'default' : 'destructive'} className="w-6 h-6 flex items-center justify-center p-0">
            {item.operation === 'plus' ? <Plus className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
          </Badge>
        )}
        <span className={`${isModal ? 'text-base font-medium' : 'text-sm'} ${valueColor}`}>
          {formatCurrency(item.value)}
        </span>
      </div>
    </div>
  );
};

// Componente de Exportação Melhorado
const ExportDropdown: React.FC<{ 
  data: DREData; 
  isDetailed: boolean; 
  periodLabel?: string;
  periodType?: string;
  selectedPeriod?: string;
  variant?: "default" | "secondary" | "outline";
}> = ({ data, isDetailed, periodLabel, periodType, selectedPeriod, variant = "default" }) => {
  
  const handleCSVExport = () => {
    exportToCSV(data, isDetailed, periodLabel, periodType, selectedPeriod);
    toast.success(`Exportação CSV ${isDetailed ? 'detalhada' : 'resumida'} concluída!`);
  };
  
  const handlePDFExport = async () => {
    await exportToPDF(data, isDetailed, periodLabel, periodType, selectedPeriod);
    toast.success(`Exportação PDF ${isDetailed ? 'detalhada' : 'resumida'} iniciada!`);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="sm" className="text-xs">
          <Download className="h-3 w-3 mr-1" />
          Exportar {isDetailed ? 'Detalhes' : ''}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Formato de Exportação</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handlePDFExport} className="cursor-pointer">
          <FileText className="h-4 w-4 mr-2" />
          Exportar como PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCSVExport} className="cursor-pointer">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exportar como CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Tabela Detalhada (para o Modal) com melhor layout
const DetailedTable: React.FC<{ data: DREData, periodLabel?: string, periodType?: string, selectedPeriod?: string }> = ({ data, periodLabel, periodType, selectedPeriod }) => {
  const detailedItems = buildDetailedDREItems(data);
  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between pb-4 px-6">
        <CardTitle className="text-xl font-semibold">DRE Detalhado</CardTitle>
        <ExportDropdown 
          data={data} 
          isDetailed={true} 
          periodLabel={periodLabel}
          periodType={periodType}
          selectedPeriod={selectedPeriod}
          variant="outline"
        />
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div className="grid grid-cols-3 py-4 px-6 border-b text-sm font-semibold text-muted-foreground bg-muted/40">
            <div className="col-span-2">Descrição</div>
            <div className="text-right">Valor</div>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {detailedItems.map((item, index) => (
              <TableRow key={index} item={item} isModal={true} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente Principal
export const DRETable: React.FC<DRETableProps> = ({ data, isLoading, error, isDetailed = false, periodType, periodLabel, selectedPeriod, onExport }) => {
  const [isExpandedModalOpen, setIsExpandedModalOpen] = useState(false);

  if (isLoading) return <LoadingState />;
  if (error || !data) return <ErrorState />;

  const summaryItems = buildSummaryDREItems(data);
  const detailedItems = buildDetailedDREItems(data);
  const displayItems = isDetailed ? detailedItems : summaryItems;

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{isDetailed ? "DRE Detalhado" : "DRE Resumido"}</CardTitle>
            <div className="flex gap-2">
              {!isDetailed && (
                <Button variant="outline" size="sm" onClick={() => setIsExpandedModalOpen(true)} className="text-xs">
                  <Maximize2 className="h-3 w-3 mr-1" />
                  Expandir
                </Button>
              )}
              <ExportDropdown 
                data={data} 
                isDetailed={isDetailed} 
                periodLabel={periodLabel}
                periodType={periodType}
                selectedPeriod={selectedPeriod}
                variant="outline"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-0">
            <div className="grid grid-cols-3 pb-3 border-b text-sm font-medium text-muted-foreground px-4">
              <div className="col-span-2">Descrição</div>
              <div className="text-right">Valor</div>
            </div>
            <div className="space-y-0">
              {displayItems.map((item, index) => <TableRow key={index} item={item} />)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isExpandedModalOpen} onOpenChange={setIsExpandedModalOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl">Demonstrativo de Resultados - Visão Detalhada</DialogTitle>
          </DialogHeader>
          <div className="overflow-hidden">
            <DetailedTable data={data} periodLabel={periodLabel} periodType={periodType} selectedPeriod={selectedPeriod} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

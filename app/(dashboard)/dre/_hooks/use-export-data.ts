"use client";

import { useState } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { formatCurrency } from "@/lib/utils";
import { 
  advancedExportService, 
  ExportData, 
  ExportCard, 
  ExportChart 
} from "@/lib/services/advanced-export-service";

interface ExportableRow {
  descricao: string;
  valor: number;
  [key: string]: any;
}

interface PDFExportOptions {
  fileName: string;
  tableData?: ExportableRow[];
  title: string;
  additionalInfo?: string;
}

interface ExcelExportOptions {
  fileName: string;
  tableData?: ExportableRow[];
  title?: string;
}

interface CSVExportOptions {
  fileName: string;
  tableData?: ExportableRow[];
}

interface AdvancedExportOptions {
  fileName: string;
  title: string;
  subtitle?: string;
  period: string;
  cards: ExportCard[];
  chart?: ExportChart;
  additionalInfo?: string;
}

interface UseExportDataOptions {
  getTableData: (isDetailed?: boolean) => ExportableRow[];
}

export const useExportData = (options: UseExportDataOptions) => {
  const [isExporting, setIsExporting] = useState(false);
  
  // Exportação avançada para PDF
  const exportToAdvancedPDF = async (exportOptions: AdvancedExportOptions) => {
    setIsExporting(true);
    
    try {
      const exportData: ExportData = {
        title: exportOptions.title,
        subtitle: exportOptions.subtitle,
        period: exportOptions.period,
        cards: exportOptions.cards,
        chart: exportOptions.chart,
        additionalInfo: exportOptions.additionalInfo,
        showLogo: true
      };

      await advancedExportService.exportToPDF(exportData, exportOptions.fileName);
    } catch (error) {
      console.error("Erro ao exportar PDF avançado:", error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  // Exportação avançada para PNG
  const exportToAdvancedPNG = async (exportOptions: AdvancedExportOptions) => {
    setIsExporting(true);
    
    try {
      const exportData: ExportData = {
        title: exportOptions.title,
        subtitle: exportOptions.subtitle,
        period: exportOptions.period,
        cards: exportOptions.cards,
        chart: exportOptions.chart,
        additionalInfo: exportOptions.additionalInfo,
        showLogo: true
      };

      await advancedExportService.exportToPNG(exportData, exportOptions.fileName);
    } catch (error) {
      console.error("Erro ao exportar PNG:", error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };
  
  // Mantém as exportações tradicionais como fallback
  const exportToPDF = ({ fileName, tableData = options.getTableData(), title, additionalInfo }: PDFExportOptions) => {
    setIsExporting(true);
    
    try {
      // Converter dados da tabela para cards de exportação
      const cards: ExportCard[] = tableData.slice(0, 4).map(row => ({
        title: row.descricao,
        value: formatCurrency(row.valor),
        color: row.valor >= 0 ? 'green' : 'red'
      }));

      // Usar o novo sistema de exportação
      const exportData: ExportData = {
        title,
        period: additionalInfo || '',
        cards,
        showLogo: true
      };

      advancedExportService.exportToPDF(exportData, fileName);
    } catch (error) {
      console.error("Erro ao exportar para PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };
  
  const exportToExcel = ({ fileName, tableData = options.getTableData(), title }: ExcelExportOptions) => {
    setIsExporting(true);
    
    try {
      const rows = tableData.map(row => ({
        "Descrição": row.descricao,
        "Valor": row.valor
      }));
      
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);
      
      if (title) {
        const titleCell = { v: title, t: 's', s: { font: { bold: true, sz: 16 } } };
        ws['A1'] = titleCell;
        ws['!ref'] = XLSX.utils.encode_range({ s: { c: 0, r: 0 }, e: { c: 1, r: rows.length } });
      }
      
      XLSX.utils.book_append_sheet(wb, ws, "DRE");
      
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${fileName}.xlsx`);
    } catch (error) {
      console.error("Erro ao exportar para Excel:", error);
    } finally {
      setIsExporting(false);
    }
  };
  
  const exportToCSV = ({ fileName, tableData = options.getTableData() }: CSVExportOptions) => {
    setIsExporting(true);
    
    try {
      let csvContent = "Descrição,Valor\n";
      
      tableData.forEach(row => {
        csvContent += `"${row.descricao}",${row.valor}\n`;
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      saveAs(blob, `${fileName}.csv`);
    } catch (error) {
      console.error("Erro ao exportar para CSV:", error);
    } finally {
      setIsExporting(false);
    }
  };
  
  return {
    isExporting,
    exportToPDF,
    exportToExcel,
    exportToCSV,
    // Novos métodos avançados
    exportToAdvancedPDF,
    exportToAdvancedPNG
  };
}; 
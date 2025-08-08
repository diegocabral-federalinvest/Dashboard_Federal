import { useState } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { formatCurrency } from "@/lib/utils";

// Definição de tipos para os dados de exportação
interface ExportableRow {
  descricao: string;
  valor: number;
  [key: string]: any;
}

// Opções para PDF
interface PDFExportOptions {
  fileName: string;
  tableData?: ExportableRow[];
  title: string;
  additionalInfo?: string;
}

// Opções para Excel
interface ExcelExportOptions {
  fileName: string;
  tableData?: ExportableRow[];
  title?: string;
}

// Opções para CSV
interface CSVExportOptions {
  fileName: string;
  tableData?: ExportableRow[];
}

// Opções para uso do hook
interface UseExportDataOptions {
  getTableData: (isDetailed?: boolean) => ExportableRow[];
}

export const useExportData = (options: UseExportDataOptions) => {
  const [isExporting, setIsExporting] = useState(false);
  
  // Exportar para PDF
  const exportToPDF = ({ fileName, tableData = options.getTableData(), title, additionalInfo }: PDFExportOptions) => {
    setIsExporting(true);
    
    try {
      const doc = new jsPDF();
      
      // Adicionar título
      doc.setFontSize(16);
      doc.text(title, 14, 22);
      
      // Adicionar informações adicionais
      if (additionalInfo) {
        doc.setFontSize(11);
        doc.text(additionalInfo, 14, 30);
      }
      
      // Preparar dados da tabela
      const tableColumn = ["Descrição", "Valor"];
      const tableRows = tableData.map(row => [
        row.descricao,
        formatCurrency(row.valor)
      ]);
      
      // Gerar tabela
      (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: additionalInfo ? 40 : 30,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 3,
          lineColor: [200, 200, 200],
        },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { halign: 'right' }
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        headStyles: {
          fillColor: [50, 50, 50],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        }
      });
      
      // Salvar o PDF
      doc.save(`${fileName}.pdf`);
    } catch (error) {
      console.error("Erro ao exportar para PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };
  
  // Exportar para Excel
  const exportToExcel = ({ fileName, tableData = options.getTableData(), title }: ExcelExportOptions) => {
    setIsExporting(true);
    
    try {
      // Preparar dados
      const rows = tableData.map(row => ({
        "Descrição": row.descricao,
        "Valor": row.valor
      }));
      
      // Criar workbook e worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);
      
      // Adicionar título se fornecido
      if (title) {
        const titleCell = { v: title, t: 's', s: { font: { bold: true, sz: 16 } } };
        ws['A1'] = titleCell;
        ws['!ref'] = XLSX.utils.encode_range({ s: { c: 0, r: 0 }, e: { c: 1, r: rows.length } });
      }
      
      // Adicionar worksheet ao workbook
      XLSX.utils.book_append_sheet(wb, ws, "DRE");
      
      // Gerar arquivo Excel e salvar
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${fileName}.xlsx`);
    } catch (error) {
      console.error("Erro ao exportar para Excel:", error);
    } finally {
      setIsExporting(false);
    }
  };
  
  // Exportar para CSV
  const exportToCSV = ({ fileName, tableData = options.getTableData() }: CSVExportOptions) => {
    setIsExporting(true);
    
    try {
      // Preparar cabeçalho
      let csvContent = "Descrição,Valor\n";
      
      // Adicionar linhas
      tableData.forEach(row => {
        csvContent += `"${row.descricao}",${row.valor}\n`;
      });
      
      // Criar blob e salvar
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
    exportToCSV
  };
}; 
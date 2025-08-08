"use client";

import { saveAs } from 'file-saver';
import { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { formatCurrency } from '@/lib/utils';

export type DataRow = Record<string, any>;

export interface ExportOptions {
  fileName?: string;
  title?: string;
  description?: string;
  columnMapping?: Record<string, string>;
  formatters?: Record<string, (value: any) => string>;
}

/**
 * Hook para exportação de dados em diferentes formatos
 * 
 * @returns Funções para exportar dados em CSV, Excel e PDF
 */
export const useExportData = () => {
  const [isExporting, setIsExporting] = useState(false);

  /**
   * Prepara os dados para exportação aplicando mapeamentos e formatadores
   */
  const prepareData = (
    data: DataRow[],
    options?: ExportOptions
  ) => {
    // Se temos um mapeamento de colunas, substituímos as chaves pelos nomes amigáveis
    const mappedData = data.map(row => {
      const newRow: DataRow = {};
      
      Object.entries(row).forEach(([key, value]) => {
        // Usar o nome mapeado ou o original se não houver mapeamento
        const newKey = options?.columnMapping?.[key] || key;
        
        // Aplicar formatador se existir para essa coluna
        const formatter = options?.formatters?.[key];
        const formattedValue = formatter ? formatter(value) : value;
        
        newRow[newKey] = formattedValue;
      });
      
      return newRow;
    });
    
    return mappedData;
  };

  /**
   * Exporta dados para CSV
   */
  const exportToCsv = async (
    data: DataRow[],
    options?: ExportOptions
  ) => {
    try {
      setIsExporting(true);
      
      const mappedData = prepareData(data, options);
      const fileName = options?.fileName || 'export.csv';
      
      // Se não temos dados, saímos
      if (mappedData.length === 0) {
        console.warn('Nenhum dado para exportar');
        setIsExporting(false);
        return;
      }
      
      // Obter cabeçalhos das colunas do primeiro item
      const headers = Object.keys(mappedData[0]);
      
      // Criar conteúdo do CSV
      let csvContent = '';
      
      // Adicionar título e descrição se fornecidos
      if (options?.title) {
        csvContent += `${options.title}\r\n`;
      }
      
      if (options?.description) {
        csvContent += `${options.description}\r\n`;
      }
      
      // Adicionar cabeçalhos
      csvContent += headers.join(';') + '\r\n';
      
      // Adicionar linhas
      mappedData.forEach(row => {
        const values = headers.map(header => {
          const val = row[header];
          // Colocar aspas apenas em strings com ponto e vírgula
          return typeof val === 'string' && val.includes(';') 
            ? `"${val}"` 
            : val;
        });
        csvContent += values.join(';') + '\r\n';
      });
      
      // Criar blob e efetuar download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, fileName);
      
    } catch (error) {
      console.error('Erro ao exportar para CSV:', error);
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Exporta dados para Excel
   */
  const exportToExcel = async (
    data: DataRow[],
    options?: ExportOptions
  ) => {
    try {
      setIsExporting(true);
      
      const mappedData = prepareData(data, options);
      const fileName = options?.fileName || 'export.xlsx';
      
      // Se não temos dados, saímos
      if (mappedData.length === 0) {
        console.warn('Nenhum dado para exportar');
        setIsExporting(false);
        return;
      }
      
      // Criar workbook e worksheet
      const wb = XLSX.utils.book_new();
      
      // Adicionar título e descrição se fornecidos
      let finalData = [...mappedData];
      if (options?.title || options?.description) {
        const header = [];
        if (options.title) header.push([options.title]);
        if (options.description) header.push([options.description]);
        header.push([]); // Linha em branco
        
        // Adicionar headers e data
        finalData = [...header, Object.keys(mappedData[0]), ...mappedData.map(row => Object.values(row))];
      } else {
        // Sem título, apenas os dados com cabeçalho
        finalData = [Object.keys(mappedData[0]), ...mappedData.map(row => Object.values(row))];
      }
      
      const ws = XLSX.utils.aoa_to_sheet(finalData as any);
      
      // Adicionar worksheet ao workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Dados');
      
      // Exportar workbook
      XLSX.writeFile(wb, fileName);
      
    } catch (error) {
      console.error('Erro ao exportar para Excel:', error);
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Exporta dados para PDF
   */
  const exportToPdf = async (
    data: DataRow[],
    options?: ExportOptions
  ) => {
    try {
      setIsExporting(true);
      
      const mappedData = prepareData(data, options);
      const fileName = options?.fileName || 'export.pdf';
      
      // Se não temos dados, saímos
      if (mappedData.length === 0) {
        console.warn('Nenhum dado para exportar');
        setIsExporting(false);
        return;
      }
      
      // Criar documento PDF
      const doc = new jsPDF();
      
      // Adicionar título e descrição
      if (options?.title) {
        doc.setFontSize(16);
        doc.text(options.title, 14, 20);
      }
      
      if (options?.description) {
        doc.setFontSize(12);
        doc.text(options.description, 14, options.title ? 30 : 20);
      }
      
      // Preparar cabeçalhos e dados para autoTable
      const headers = Object.keys(mappedData[0]);
      const rows = mappedData.map(row => Object.values(row));
      
      // Configurar posição inicial da tabela
      const startY = options?.title || options?.description ? 40 : 20;
      
      // Gerar tabela
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY,
        headStyles: {
          fillColor: [4, 8, 91], // Azul Federal Invest
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [240, 240, 245],
        },
        margin: { top: 10 },
      });
      
      // Salvar PDF
      doc.save(fileName);
      
    } catch (error) {
      console.error('Erro ao exportar para PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportToCsv,
    exportToExcel,
    exportToPdf,
    isExporting
  };
};
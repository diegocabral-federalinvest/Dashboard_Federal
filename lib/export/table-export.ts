import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { TableColumn, TableData } from '@/components/ui/advanced-data-table';

type ExportFormat = 'csv' | 'xlsx';

// Formato do cabeçalho: título da coluna e chave correspondente
interface ExportOptions {
  filename?: string;
  includeHeaders?: boolean;
  dateFormat?: Intl.DateTimeFormatOptions;
}

// Função para formatar valores para exportação
const formatValueForExport = (value: any, type: string): string => {
  if (value === null || value === undefined || value === '') return '';
  
  switch (type) {
    case 'currency':
      const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
      return isNaN(numValue) ? '' : numValue.toString();
    
    case 'decimal':
      const decValue = typeof value === 'string' ? parseFloat(value) : Number(value);
      return isNaN(decValue) ? '' : decValue.toString();
    
    case 'percent':
      const pctValue = typeof value === 'string' ? parseFloat(value) : Number(value);
      return isNaN(pctValue) ? '' : (pctValue / 100).toString();
    
    case 'date':
      try {
        const date = new Date(value);
        return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
      } catch {
        return '';
      }
    
    default:
      return value?.toString() || '';
  }
};

// Exportar para CSV
export const exportToCSV = (
  data: TableData[],
  columns: TableColumn[],
  options: ExportOptions = {}
) => {
  const { 
    filename = 'dados_exportados', 
    includeHeaders = true 
  } = options;
  
  // Filtrar apenas as colunas que queremos exportar
  const exportColumns = columns;
  
  // Criar linhas de dados
  let csvContent = '';
  
  // Adicionar cabeçalho se solicitado
  if (includeHeaders) {
    const headers = exportColumns.map(col => `"${col.title}"`).join(',');
    csvContent += headers + '\r\n';
  }
  
  // Adicionar dados
  data.forEach(row => {
    const rowData = exportColumns
      .map(col => {
        const formattedValue = formatValueForExport(row[col.key], col.type);
        // Escapar aspas em valores de texto
        return `"${formattedValue.replace(/"/g, '""')}"`;
      })
      .join(',');
    
    csvContent += rowData + '\r\n';
  });
  
  // Criar um Blob e fazer o download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}.csv`);
};

// Exportar para XLSX
export const exportToXLSX = (
  data: TableData[],
  columns: TableColumn[],
  options: ExportOptions = {}
) => {
  const { 
    filename = 'dados_exportados', 
    includeHeaders = true 
  } = options;
  
  // Filtrar apenas as colunas que queremos exportar
  const exportColumns = columns;
  
  // Preparar dados para o XLSX
  const xlsxData = includeHeaders 
    ? [
        // Cabeçalhos
        exportColumns.map(col => col.title),
        // Dados
        ...data.map(row => 
          exportColumns.map(col => formatValueForExport(row[col.key], col.type))
        )
      ]
    : data.map(row => 
        exportColumns.map(col => formatValueForExport(row[col.key], col.type))
      );
  
  // Criar uma planilha
  const ws = XLSX.utils.aoa_to_sheet(xlsxData);
  
  // Criar um livro
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Dados');
  
  // Exportar para XLSX
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

// Função de exportação principal
export const exportTableData = (
  data: TableData[],
  columns: TableColumn[],
  format: ExportFormat,
  options: ExportOptions = {}
) => {
  switch (format) {
    case 'csv':
      exportToCSV(data, columns, options);
      break;
    case 'xlsx':
      exportToXLSX(data, columns, options);
      break;
  }
};

// Componente para exibir menu de exportação
export const getExportOptions = (
  data: TableData[],
  columns: TableColumn[],
  filename: string = 'dados_exportados'
) => {
  return [
    {
      label: 'Exportar para CSV',
      onClick: () => exportTableData(data, columns, 'csv', { filename }),
    },
    {
      label: 'Exportar para Excel',
      onClick: () => exportTableData(data, columns, 'xlsx', { filename }),
    },
  ];
}; 
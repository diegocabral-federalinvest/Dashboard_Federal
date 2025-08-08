// Financial Data CSV row type - Alinhado com schema do banco
export interface FinancialDataCSV {
  id: string;
  IdOperacao: string;
  CPFCNPJCedente?: string;
  Data: string | null;
  Fator?: string | null;
  AdValorem?: string | null;
  ValorFator?: string | null;
  ValorAdValorem?: string | null;
  ValorIOF?: string | null;
  RetencaoPIS?: string | null;
  RetencaoIR?: string | null;
  RetencaoCSLL?: string | null;
  RetencaoCOFINS?: string | null;
  PIS?: string | null;
  CSLL?: string | null;
  COFINS?: string | null;
  ISSQN?: string | null;
  ValorTarifas?: string | null;
  ValorLiquido?: string | null;
  ValorIOFAdicional?: string | null;
  RetencaoISS?: string | null;
  IRPJ?: string | null;
  DataFinalizacao?: string | null;
  Pais?: string | null;
  Regiao?: string | null;
  Etapa?: string | null;
  DataPagamento?: string | null;
  createdAt: string;
  updatedAt: string;
}

// File upload metadata type
export interface FileUpload {
  id: string;
  filename: string;
  originalFilename: string;
  size: number;
  mimetype: string;
  rows: number;
  status: "success" | "error" | "processing";
  error?: string;
  processingTime?: number;
  createdAt: string;
  updatedAt: string;
}

// Tax deduction type
export interface TaxDeduction {
  id: number;
  year: number;
  quarter: number;
  value: number;
  createdAt: string;
  updatedAt: string;
}

// Types for DRE (Demonstrativo de Resultados do Exercício)
export interface DREPeriod {
  month?: number;
  quarter?: number;
  year: number;
}

// Exportable row type for exporting data
export interface ExportableRow {
  descricao: string;
  valor: number;
  [key: string]: any;
} 
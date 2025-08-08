// Hooks de API
export { useGetDRE } from "./api/use-get-dre";
export { useGetTaxProjection } from "./api/use-get-tax-projection";
export { useUploadCSV } from "./api/use-upload-csv";

// Interfaces e tipos
export { type DREData } from "./api/use-get-dre";
export { type UploadCSVResponse } from "./api/use-upload-csv";

export interface FinancialOperation {
id: string;
IdOperacao: string;
CPFCNPJCedente: string;
Data: Date;
Fator: number;
AdValorem: number;
ValorFator: number;
ValorAdValorem: number;
ValorIOF: number;
RetencaoPIS: number;
RetencaoIR: number;
RetencaoCSLL: number;
RetencaoCOFINS: number;
PIS: number;
CSLL: number;
COFINS: number;
ISSQN: number;
ValorTarifas: number;
ValorLiquido: number; 
ValorIOFAdicional: number;
RetencaoISS: number;
IRPJ: number;
DataFinalizacao: Date;
Pais: string;
Regiao: string;
Etapa: string;
DataPagamento: Date;
} 


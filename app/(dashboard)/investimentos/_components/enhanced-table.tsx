"use client";

import { useMemo, useCallback } from "react";
import { Edit2, Trash2 } from "lucide-react";
import { AdvancedDataTable } from "@/components/ui/advanced-data-table";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, formatPercent } from "@/lib/utils";
import { InvestmentCalculation } from "../_types";

interface EnhancedTableProps {
  data: InvestmentCalculation[];
  isLoading?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  pageSize?: number;
}

export function EnhancedTable({ 
  data, 
  isLoading = false, 
  onEdit, 
  onDelete,
  pageSize = 10 
}: EnhancedTableProps) {

  // Handlers para ações
  const handleEdit = useCallback((id: string) => {
    onEdit?.(id);
  }, [onEdit]);

  const handleDelete = useCallback((id: string) => {
    onDelete?.(id);
  }, [onDelete]);

  // Convertendo dados para o formato TableData com ações
  const tableData = useMemo(() => {
    return data.map((item) => ({
      id: item.id,
      investor: `${item.investorName} (${item.investorId.slice(-4)})`,
      date: formatDate(item.date),
      initial: item.caixaInicial,
      deposit: item.aporte,
      total: item.totalAportado,
      rate: item.retornoPorcentagem,
      income: item.rendimentoPeriodo,
      balance: item.caixaFinal,
      investorId: item.investorId,
    }));
  }, [data]);

  // Definindo colunas
  const columns = useMemo(() => [
    {
      key: "investor",
      title: "Investidor",
      type: "text" as const,
      sortable: true,
      filterable: true,
      width: "200px",
    },
    {
      key: "date",
      title: "Data",
      type: "text" as const,
      sortable: true,
      filterable: true,
      width: "120px",
    },
    {
      key: "initial",
      title: "Caixa",
      type: "currency" as const,
      sortable: true,
      filterable: false,
      width: "120px",
    },
    {
      key: "deposit",
      title: "Aporte",
      type: "currency" as const,
      sortable: true,
      filterable: false,
      width: "120px",
    },
    {
      key: "total",
      title: "Total em Aportes",
      type: "currency" as const,
      sortable: true,
      filterable: false,
      width: "150px",
    },
    {
      key: "income",
      title: "Renda",
      type: "currency" as const,
      sortable: true,
      filterable: false,
      width: "120px",
    },
    {
      key: "balance",
      title: "Saldo",
      type: "currency" as const,
      sortable: true,
      filterable: false,
      width: "120px",
    },
    {
      key: "actions",
      title: "Ações",
      type: "actions" as const,
      sortable: false,
      filterable: false,
      width: "100px",
      render: (value: any, row: any) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row.id)}
            className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20"
          >
            <Edit2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="sr-only">Editar investimento</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.id)}
            className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
            <span className="sr-only">Deletar investimento</span>
          </Button>
        </div>
      ),
    },
  ], [handleEdit, handleDelete]);

  // Função customizada para formatar valores
  const formatValue = (value: any, type: string) => {
    if (value === null || value === undefined || value === "") return "-";
    
    switch (type) {
      case "currency":
        const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
        if (isNaN(numValue)) return "-";
        return formatCurrency(numValue);
      
      case "percent":
        const pctValue = typeof value === 'string' ? parseFloat(value) : Number(value);
        if (isNaN(pctValue)) return "-";
        return `${formatPercent(pctValue)}/dia`;
      
      case "text":
      default:
        return value?.toString() || "-";
    }
  };

  return (
    <div className="space-y-4">
      <AdvancedDataTable 
        data={tableData}
        columns={columns}
        isLoading={isLoading}
        pageSize={pageSize}
        formatValue={formatValue}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl"
        searchPlaceholder="Buscar por investidor..."
      />
    </div>
  );
}
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Investment } from "../api/use-get-investment";
import { formatCurrency } from "@/lib/utils";

// Função para formatar valores com alta precisão (5 casas decimais)
export const formatCurrencyHighPrecision = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 5,
    maximumFractionDigits: 5,
  }).format(value);
};

// Interface estendida para incluir campos calculados
interface InvestmentWithCalculations extends Investment {
  returns?: number;        // Rendimentos acumulados
  percentage?: number;     // % de rendimento
  totalValue?: number;     // Valor total atual (principal + rendimentos)
}

export const investmentsColumns: ColumnDef<InvestmentWithCalculations>[] = [
  {
    id: "investorName", // Adicionar ID explícito para coluna com header JSX
    accessorKey: "investorName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-slate-300 hover:text-white"
        >
          Investidor
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium text-slate-200 max-w-[180px] truncate">
        {row.getValue("investorName") || "N/A"}
      </div>
    ),
  },
  {
    id: "date", // Adicionar ID explícito para coluna com header JSX
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-slate-300 hover:text-white"
        >
          Data
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"));
      return (
        <div className="text-slate-300 font-mono text-sm">
          {format(date, "dd/MM/yyyy", { locale: ptBR })}
        </div>
      );
    },
  },
  {
    id: "value", // Adicionar ID explícito para coluna com header JSX
    accessorKey: "value",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-slate-300 hover:text-white"
        >
          Valor
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value = parseFloat(row.getValue("value"));
      const formatted = formatCurrency(Math.abs(value));
      const isNegative = value < 0;

      return (
        <div className={`font-medium text-right font-mono ${
          isNegative ? 'text-red-400' : 'text-emerald-400'
        }`}>
          {isNegative ? '-' : ''}{formatted}
        </div>
      );
    },
  },
  {
    id: "description", // Adicionar ID explícito para coluna com header JSX
    accessorKey: "description",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-slate-300 hover:text-white"
        >
          Descrição
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-slate-300 max-w-[200px] truncate">
        {row.getValue("description") || "Sem descrição"}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      
      if (status === "active") {
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Ativo</Badge>;
      } else if (status === "completed") {
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Concluído</Badge>;
      } else {
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Retirado</Badge>;
      }
    },
  },
  {
    id: "returns", // Adicionar ID explícito para coluna com header JSX
    accessorKey: "returns",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-slate-300 hover:text-white"
        >
          Rendimento
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const returns = row.original.returns || 0;
      const percentage = row.original.percentage || 0;
      
      return (
        <div className="text-right">
          <div className="text-emerald-400 font-medium font-mono">
            {formatCurrencyHighPrecision(returns)}
          </div>
          <div className="text-xs text-emerald-300">
            +{percentage.toFixed(3)}%
          </div>
        </div>
      );
    },
  },
  {
    id: "totalValue", // Adicionar ID explícito para coluna com header JSX
    accessorKey: "totalValue",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-slate-300 hover:text-white"
        >
          Total
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const totalValue = row.original.totalValue || 0;
      
      return (
        <div className="font-bold text-right text-cyan-400 font-mono">
          {formatCurrencyHighPrecision(totalValue)}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const investment = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
            <DropdownMenuLabel className="text-slate-300">Ações</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(investment.id)}
              className="text-slate-300 hover:text-white hover:bg-slate-800"
            >
              Copiar ID
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-800">
              Ver Detalhes
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 
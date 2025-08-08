// Constantes do Dashboard do Investidor

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Copy, ArrowUpDown, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

// Função auxiliar para copy
const copyToClipboard = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copiado para área de transferência!`);
  } catch (err) {
    toast.error("Erro ao copiar para área de transferência");
  }
};

// Função auxiliar para copy da linha inteira
const copyRowToClipboard = async (row: InvestmentRowData) => {
  const rowText = `Data: ${row.date} | Tipo: ${row.type} | Valor: ${formatCurrency(row.value)} | Retorno: ${row.return}`;
  await copyToClipboard(rowText, "Linha");
};

// Componente para célula com hover e copy
const CopyableCell = ({ 
  value, 
  label, 
  children, 
  className = "" 
}: { 
  value: string; 
  label: string; 
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`cursor-pointer hover:bg-blue-50/10 dark:hover:bg-blue-900/20 rounded p-1 transition-all duration-200 hover:scale-105 ${className}`}
            onClick={() => copyToClipboard(value, label)}
          >
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Clique para copiar {label.toLowerCase()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export interface InvestmentRowData {
  id: string;
  date: string;
  type: "Aporte" | "Resgate" | "Rendimento";
  value: number;
  return: string;
  status: "Concluído" | "Pendente" | "Cancelado";
}

export const TABLE_COLUMNS: ColumnDef<InvestmentRowData>[] = [
  {
    id: "date", // Adicionar ID explícito para coluna com header JSX
    accessorKey: "date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-blue-500/10 text-blue-100 hover:text-white transition-colors"
      >
        Data
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <CopyableCell value={row.getValue("date")} label="Data">
        <div className="font-medium text-blue-100 dark:text-blue-200">
          {row.getValue("date")}
        </div>
      </CopyableCell>
    ),
  },
  {
    id: "type", // Adicionar ID explícito para coluna com header JSX
    accessorKey: "type",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-blue-500/10 text-blue-100 hover:text-white transition-colors"
      >
        Tipo
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      const getTypeConfig = (type: string) => {
        switch (type) {
          case "Aporte":
            return { 
              color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
              icon: <TrendingUp className="w-3 h-3" />
            };
          case "Resgate":
            return { 
              color: "bg-red-500/20 text-red-400 border-red-500/30",
              icon: <TrendingDown className="w-3 h-3" />
            };
          default:
            return { 
              color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
              icon: <Minus className="w-3 h-3" />
            };
        }
      };
      
      const config = getTypeConfig(type);
      
      return (
        <CopyableCell value={type} label="Tipo">
          <Badge 
            variant="outline" 
            className={`${config.color} flex items-center gap-1 w-fit hover:scale-110 transition-transform`}
          >
            {config.icon}
            {type}
          </Badge>
        </CopyableCell>
      );
    },
  },
  {
    id: "value", // Adicionar ID explícito para coluna com header JSX
    accessorKey: "value",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-blue-500/10 text-blue-100 hover:text-white transition-colors"
      >
        Valor
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const value = parseFloat(row.getValue("value"));
      const formatted = formatCurrency(value);
      
      return (
        <CopyableCell value={formatted} label="Valor" className="font-mono">
          <div className="text-blue-100 dark:text-blue-200 font-semibold">
            {formatted}
          </div>
        </CopyableCell>
      );
    },
  },
  {
    accessorKey: "return",
    header: "Retorno (1,2% ao mês)",
    cell: ({ row }) => {
      const returnValue = row.getValue("return") as string;
      const isPositive = returnValue.includes("+");
      
      return (
        <CopyableCell value={returnValue} label="Retorno">
          <div className={`font-mono font-semibold ${
            isPositive ? "text-emerald-400" : "text-red-400"
          }`}>
            {returnValue}
          </div>
        </CopyableCell>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const getStatusColor = (status: string) => {
        switch (status) {
          case "Concluído":
            return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
          case "Pendente":
            return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
          case "Cancelado":
            return "bg-red-500/20 text-red-400 border-red-500/30";
          default:
            return "bg-blue-500/20 text-blue-400 border-blue-500/30";
        }
      };
      
      return (
        <CopyableCell value={status} label="Status">
          <Badge 
            variant="outline" 
            className={`${getStatusColor(status)} hover:scale-110 transition-transform`}
          >
            {status}
          </Badge>
        </CopyableCell>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const investment = row.original;

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="h-8 w-8 p-0 hover:bg-blue-500/20 transition-colors"
                  >
                    <span className="sr-only">Abrir menu</span>
                    <MoreHorizontal className="h-4 w-4 text-blue-100" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="bg-slate-900/95 border-blue-600/30 backdrop-blur-sm"
                >
                  <DropdownMenuItem 
                    onClick={() => copyToClipboard(investment.id, "ID do investimento")}
                    className="hover:bg-blue-500/20 text-blue-100 cursor-pointer"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar ID
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => copyRowToClipboard(investment)}
                    className="hover:bg-blue-500/20 text-blue-100 cursor-pointer"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar linha completa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent>
              <p>Opções de cópia</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
];

export const DASHBOARD_CONFIG = {
  maxTableRows: 10,
  refreshInterval: 30000, // 30 segundos
  chartHeight: 300,
  enableAnimations: true,
  CHART_DAYS: 30, // Número de dias para dados do gráfico
}; 
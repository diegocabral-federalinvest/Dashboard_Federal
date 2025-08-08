"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { 
  Loader2, 
  Download, 
  Search, 
  Filter, 
  Eye, 
  EyeOff, 
  SlidersHorizontal,
  ChevronDown,
  Check,
  Calendar,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useGetRawFinancialData } from "@/features/finance/api/use-get-raw-financial-data";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { FinancialDataCSV } from "@/features/finance/types/index";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export interface RawDataTableProps {
  limit?: number;
}

// Custom Date Range Picker with improved UX
const ImprovedDateRangePicker = ({ 
  value, 
  onValueChange 
}: { 
  value: { from: Date | undefined; to: Date | undefined };
  onValueChange: (value: { from: Date | undefined; to: Date | undefined }) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (range: any) => {
    if (range) {
      onValueChange({
        from: range.from,
        to: range.to
      });
      if (range.from && range.to) {
        setIsOpen(false);
      }
    }
  };

  const displayValue = () => {
    if (!value.from && !value.to) {
      return "Selecione um período";
    }
    if (value.from && !value.to) {
      return `${format(value.from, "dd/MM/yyyy")} - ...`;
    }
    if (value.from && value.to) {
      return `${format(value.from, "dd/MM/yyyy")} - ${format(value.to, "dd/MM/yyyy")}`;
    }
    return "Selecione um período";
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value.from && !value.to && "text-muted-foreground"
          )}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {displayValue()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 space-y-3">
          <div className="space-y-1">
            <h4 className="font-medium text-sm">Período</h4>
            <p className="text-xs text-muted-foreground">
              Selecione a data inicial e final
            </p>
          </div>
          <CalendarComponent
            mode="range"
            selected={{ from: value.from, to: value.to }}
            onSelect={handleSelect}
            numberOfMonths={2}
            locale={ptBR}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => {
                const now = new Date();
                onValueChange({
                  from: startOfMonth(now),
                  to: endOfMonth(now)
                });
                setIsOpen(false);
              }}
            >
              Este mês
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => {
                onValueChange({ from: undefined, to: undefined });
              }}
            >
              Limpar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export function RawDataTable({ limit = 10 }: RawDataTableProps) {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(limit);
  const [sortBy, setSortBy] = useState<string>("data");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  
  // Filtros avançados
  const [filters, setFilters] = useState<{
    minValue?: number;
    maxValue?: number;
    [key: string]: any;
  }>({});

  // Estado para gerenciar colunas visíveis
  const [visibleColumns, setVisibleColumns] = useState<{[key: string]: boolean}>({});
  const [showFilters, setShowFilters] = useState(false);
  const [columnFilters, setColumnFilters] = useState<{[key: string]: string}>({});
  
  // Colunas disponíveis - Usando nomes exatos do banco de dados
  const columns = useMemo(() => [
    { key: "IdOperacao", title: "ID Operação", type: "text" },
    { key: "Data", title: "Data", type: "date" },
    { key: "CPFCNPJCedente", title: "CPF/CNPJ Cedente", type: "text" },
    { key: "Fator", title: "Fator", type: "decimal" },
    { key: "AdValorem", title: "AdValorem", type: "decimal" },
    { key: "ValorFator", title: "Valor Fator", type: "currency" },
    { key: "ValorAdValorem", title: "Valor AdValorem", type: "currency" },
    { key: "ValorIOF", title: "Valor IOF", type: "currency" },
    { key: "RetencaoPIS", title: "Retenção PIS", type: "currency" },
    { key: "RetencaoIR", title: "Retenção IR", type: "currency" },
    { key: "RetencaoCSLL", title: "Retenção CSLL", type: "currency" },
    { key: "RetencaoCOFINS", title: "Retenção COFINS", type: "currency" },
    { key: "PIS", title: "PIS", type: "currency" },
    { key: "CSLL", title: "CSLL", type: "currency" },
    { key: "COFINS", title: "COFINS", type: "currency" },
    { key: "ISSQN", title: "ISSQN", type: "currency" },
    { key: "ValorTarifas", title: "Valor Tarifas", type: "currency" },
    { key: "ValorLiquido", title: "Valor Líquido", type: "currency" },
    { key: "ValorIOFAdicional", title: "Valor IOF Adicional", type: "currency" },
    { key: "RetencaoISS", title: "Retenção ISS", type: "currency" },
    { key: "IRPJ", title: "IRPJ", type: "currency" },
    { key: "DataFinalizacao", title: "Data Finalização", type: "date" },
    { key: "Pais", title: "País", type: "text" },
    { key: "Regiao", title: "Região", type: "text" },
    { key: "Etapa", title: "Etapa", type: "text" },
    { key: "DataPagamento", title: "Data Pagamento", type: "date" },
  ], []);

  // Inicializar as colunas visíveis
  useEffect(() => {
    const initialVisibleColumns = columns.reduce((acc, column) => {
      // Mostrar apenas algumas colunas por padrão
      acc[column.key] = ["IdOperacao", "Data", "CPFCNPJCedente", "ValorLiquido", "Etapa"].includes(column.key);
      return acc;
    }, {} as {[key: string]: boolean});
    
    setVisibleColumns(initialVisibleColumns);
  }, [columns]);
  
  const {
    data: rawData,
    isLoading,
    error,
    refetch
  } = useGetRawFinancialData({
    page,
    pageSize,
    sortBy,
    sortOrder,
    searchTerm,
    startDate: dateRange.from,
    endDate: dateRange.to,
    ...filters,
    ...columnFilters
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    refetch();
  };
  
  const handleSortChange = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleColumnFilterChange = (key: string, value: string) => {
    setColumnFilters(prev => {
      if (!value) {
        const newFilters = { ...prev };
        delete newFilters[key];
        return newFilters;
      }
      return { ...prev, [key]: value };
    });
  };
  
  const handleExport = () => {
    // Implementação para exportar os dados
    toast({
      title: "Exportação iniciada",
      description: "Os dados estão sendo preparados para exportação.",
    });
  };

  const toggleColumnVisibility = (columnKey: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  const resetColumnVisibility = () => {
    const allVisible = columns.reduce((acc, column) => {
      acc[column.key] = true;
      return acc;
    }, {} as {[key: string]: boolean});
    
    setVisibleColumns(allVisible);
  };

  // Formatar valor para exibição
  const formatValue = (value: any, type: string) => {
    if (value === null || value === undefined || value === "") return "-";
    
    if (type === "currency") {
      const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
      if (isNaN(numValue)) return "-";
      return formatCurrency(numValue);
    }
    
    if (type === "decimal") {
      const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
      if (isNaN(numValue)) return "-";
      return numValue.toFixed(6);
    }
    
    if (type === "date") {
      try {
        const date = new Date(value);
        if (isNaN(date.getTime())) return "-";
        return format(date, "dd/MM/yyyy", { locale: ptBR });
      } catch {
        return "-";
      }
    }
    
    if (type === "percent") {
      const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
      if (isNaN(numValue)) return "-";
      return `${numValue.toFixed(2)}%`;
    }
    
    return value?.toString() || "-";
  };

  // Filtrar apenas as colunas visíveis
  const visibleColumnsArray = columns.filter(column => visibleColumns[column.key]);
  
  // Calcular totais para cada coluna numérica
  const calculateTotals = () => {
    if (!rawData?.data.length) return {};
    
    return columns.reduce((acc, column) => {
      if (column.type === "currency") {
        acc[column.key] = rawData.data.reduce((sum, item) => {
          const value = item[column.key as keyof FinancialDataCSV];
          return sum + (typeof value === 'number' ? value : 0);
        }, 0);
      }
      return acc;
    }, {} as {[key: string]: number});
  };
  
  const totals = calculateTotals();

  // Calculate pagination info safely
  const startIndex = rawData?.totalRecords ? ((page - 1) * pageSize) + 1 : 0;
  const endIndex = rawData?.totalRecords ? Math.min(page * pageSize, rawData.totalRecords) : 0;
  const totalRecords = rawData?.totalRecords || 0;
  const totalPages = rawData?.totalPages || 0;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Dados Financeiros Importados</CardTitle>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                                <Button variant="neonOutline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Colunas ({Object.values(visibleColumns).filter(Boolean).length})
              </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Visibilidade de Colunas</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {columns.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.key}
                      checked={visibleColumns[column.key]}
                      onCheckedChange={() => toggleColumnVisibility(column.key)}
                    >
                      {column.title}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <Button 
                      variant="neonGhost" 
                      size="sm"
                      className="w-full"
                      onClick={resetColumnVisibility}
                    >
                      Mostrar Todas
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="neonGhost" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? "Ocultar" : "Filtros"}
              </Button>
              
              <Button variant="neon" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Paginação no topo */}
          {totalRecords > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pb-3 border-b">
              <div className="text-sm text-muted-foreground">
                Mostrando {startIndex}-{endIndex} de {totalRecords} {totalRecords === 1 ? 'item' : 'itens'}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(1)}
                  disabled={page === 1}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <ChevronLeft className="h-4 w-4 -ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  <Input
                    className="w-16 h-8 text-center"
                    value={page}
                    onChange={(e) => {
                      const newPage = parseInt(e.target.value) || 1;
                      if (newPage >= 1 && newPage <= totalPages) {
                        handlePageChange(newPage);
                      }
                    }}
                  />
                  <span className="text-sm text-muted-foreground">
                    de {totalPages}
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={page === totalPages}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                  <ChevronRight className="h-4 w-4 -ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Filtros Básicos */}
        <div className="mb-6 space-y-4">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Pesquisar</label>
              <div className="flex">
                <Input
                  placeholder="Buscar por ID, cliente, CPF/CNPJ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-r-none"
                />
                <Button type="submit" className="rounded-l-none">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="md:w-auto w-full">
              <label className="text-sm font-medium mb-1 block">Período</label>
              <ImprovedDateRangePicker
                value={dateRange}
                onValueChange={setDateRange}
              />
            </div>

            <div className="flex-none">
              <label className="text-sm font-medium mb-1 block">Itens por página</label>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(1); // Reset to first page when changing page size
                }}
              >
                <SelectTrigger className="w-full md:w-[100px]">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
          
          {/* Filtros Avançados */}
          {showFilters && (
            <div className="p-4 border rounded-md mt-4 bg-muted/20">
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filtros Avançados
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Valor Mínimo</label>
                  <Input
                    type="number"
                    placeholder="R$ 0,00"
                    onChange={(e) => handleFilterChange("minValue", e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Valor Máximo</label>
                  <Input
                    type="number"
                    placeholder="R$ 0,00"
                    onChange={(e) => handleFilterChange("maxValue", e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
                
                {columns.filter(col => col.type === "text").map(column => (
                  <div key={`filter-${column.key}`}>
                    <label className="text-sm font-medium mb-1 block">{column.title}</label>
                    <Input
                      placeholder={`Filtrar por ${column.title.toLowerCase()}`}
                      onChange={(e) => handleColumnFilterChange(column.key, e.target.value)}
                      value={columnFilters[column.key] || ""}
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mr-2"
                  onClick={() => {
                    setColumnFilters({});
                    setFilters({});
                  }}
                >
                  Limpar Filtros
                </Button>
                <Button 
                  size="sm"
                  onClick={() => {
                    setPage(1);
                    refetch();
                  }}
                >
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Tabela */}
        <div className="rounded-md border overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              Erro ao carregar dados: {(error as Error).message}
            </div>
          ) : !rawData?.data.length ? (
            <div className="p-8 text-center text-muted-foreground">
              Nenhum dado encontrado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {visibleColumnsArray.map((column) => (
                      <TableHead 
                        key={column.key}
                        className="cursor-pointer hover:bg-muted/50 whitespace-nowrap"
                        onClick={() => handleSortChange(column.key)}
                      >
                        <div className="flex items-center">
                          {column.title}
                          {sortBy === column.key && (
                            <span className="ml-1">
                              {sortOrder === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rawData?.data.map((item: FinancialDataCSV) => (
                    <TableRow key={item.id} className="hover:bg-muted/30">
                      {visibleColumnsArray.map((column) => {
                        const value = item[column.key as keyof FinancialDataCSV];
                        const isNumeric = column.type === 'currency' || column.type === 'decimal';
                        const numValue = isNumeric ? (typeof value === 'string' ? parseFloat(value) : Number(value)) : NaN;
                        const isNegative = isNumeric && !isNaN(numValue) && numValue < 0;
                        const cellClassName = `whitespace-nowrap ${isNegative ? 'text-red-500' : ''}`;

                        return (
                          <TableCell key={`${item.id}-${column.key}`} className={cellClassName}>
                            {formatValue(value, column.type)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                  
                  {/* Linha de totais */}
                  {Object.keys(totals).length > 0 && (
                    <TableRow className="font-medium bg-muted/20 border-t-2">
                      {visibleColumnsArray.map((column) => {
                        const totalValue = totals[column.key];
                        const isNegative = typeof totalValue === 'number' && totalValue < 0;
                        const cellClassName = `${isNegative ? 'text-red-500' : ''}`;
                        
                        return (
                          <TableCell key={`total-${column.key}`} className={cellClassName}>
                            {column.type === "currency" && totalValue !== undefined
                              ? formatCurrency(totalValue)
                              : column.key === visibleColumnsArray[0].key 
                                ? "Totais" 
                                : ""}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 
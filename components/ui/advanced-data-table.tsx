"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Eye, 
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileText,
  FileSpreadsheet,
  X,
  Search,
  MoreHorizontal,
  ChevronsLeft,
  ChevronsRight,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FilterModal } from "./filter-modal";
import { exportTableData } from "@/lib/export/table-export";

import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
  VisibilityState,
  getFacetedRowModel,
  getFacetedUniqueValues,
} from "@tanstack/react-table"

export interface TableColumn {
  key: string;
  title: string;
  type: "text" | "number" | "currency" | "date" | "decimal" | "percent" | "actions";
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (value: any, row: any) => React.ReactNode;
}

export interface TableData {
  [key: string]: any;
}

export interface AdvancedDataTableProps<TData> {
  columns: TableColumn[];
  data: TData[];
  searchPlaceholder?: string;
  enableFiltering?: boolean;
  enableSorting?: boolean;
  enableColumnVisibility?: boolean;
  enablePagination?: boolean;
  defaultPageSize?: number;
  pageSizeOptions?: readonly number[];
  showFilterText?: boolean;
  showFiltersControl?: boolean;
  // Props já utilizadas ao longo do arquivo (mantidas como opcionais)
  title?: string;
  isLoading?: boolean;
  error?: Error | null;
  totalRecords?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSort?: (column: string, direction: "asc" | "desc") => void;
  onFilter?: (filters: Record<string, string>) => void;
  onExport?: () => void;
  formatValue?: (value: any, type: string) => string;
  className?: string;
  defaultVisibleColumns?: string[];
  searchColumn?: string;
  description?: string;
  showFilters?: boolean;
  enableRowSelection?: boolean;
  onDeleteSelected?: (ids: string[]) => void;
  onDeleteAll?: () => void;
  getRowId?: (row: TableData) => string;
}

export function AdvancedDataTable<TData extends TableData = TableData>({
  columns,
  data,
  searchPlaceholder = "Buscar...",
  enableFiltering = true,
  enableSorting = true,
  enableColumnVisibility = true,
  enablePagination = true,
  defaultPageSize = 10,
  pageSizeOptions = [10, 20, 30, 50, 100],
  showFilterText = false,
  showFiltersControl = true,
  // Extras opcionais já usados no arquivo
  title,
  isLoading = false,
  error = null,
  totalRecords = 0,
  currentPage = 1,
  pageSize = defaultPageSize,
  onPageChange,
  onPageSizeChange,
  onSort,
  onFilter,
  onExport,
  formatValue,
  className,
  defaultVisibleColumns,
  searchColumn,
  description,
  showFilters = true,
  enableRowSelection = true,
  onDeleteSelected,
  onDeleteAll,
  getRowId,
}: AdvancedDataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [filterStates, setFilterStates] = useState<Record<string, string | undefined>>({})
  const [globalFilter, setGlobalFilter] = useState("")

  // Formatação de valores - mover para antes dos useMemos
  const defaultFormatValue = useCallback((value: any, type: string) => {
    if (value === null || value === undefined || value === "") return "-";
    
    switch (type) {
      case "currency":
        const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
        if (isNaN(numValue)) return "-";
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL"
        }).format(numValue);
      
      case "decimal":
        const decValue = typeof value === 'string' ? parseFloat(value) : Number(value);
        if (isNaN(decValue)) return "-";
        return decValue.toFixed(6);
      
      case "percent":
        const pctValue = typeof value === 'string' ? parseFloat(value) : Number(value);
        if (isNaN(pctValue)) return "-";
        return `${pctValue.toFixed(2)}%`;
      
      case "date":
        try {
          const date = new Date(value);
          if (isNaN(date.getTime())) return "-";
          return date.toLocaleDateString("pt-BR");
        } catch {
          return "-";
        }
      
      default:
        return value?.toString() || "-";
    }
  }, []);

  const valueFormatter = formatValue || defaultFormatValue;

  // Usar searchColumn se especificado, caso contrário buscar em todas as colunas
  const searchFilteredData = useMemo(() => {
    if (!globalFilter) return data;
    
    if (searchColumn) {
      // Buscar apenas na coluna especificada
      return data.filter(row => 
        row[searchColumn]?.toString().toLowerCase().includes(globalFilter.toLowerCase())
      );
    } else {
      // Buscar em todas as colunas
      return data.filter(row => 
        Object.values(row).some(value => 
          value?.toString().toLowerCase().includes(globalFilter.toLowerCase())
        )
      );
    }
  }, [data, globalFilter, searchColumn]);

  // Converter TableColumn[] para ColumnDef[]
  const tableColumns: ColumnDef<TableData, any>[] = useMemo(() => {
    return columns.map((col): ColumnDef<TableData, any> => ({
      id: col.key, // Adicionar ID explícito
      accessorKey: col.key,
      header: col.title,
      cell: ({ row }) => {
        // Se for coluna de ações e tiver função render, usa ela
        if (col.type === "actions" && col.render) {
          return col.render(row.getValue(col.key), row.original);
        }
        const value = row.getValue(col.key);
        return valueFormatter(value, col.type);
      },
      enableSorting: col.sortable !== false,
      enableColumnFilter: col.filterable !== false,
      filterFn: "includesString",
    }));
  }, [columns, valueFormatter]);

  // Verificação adicional para garantir que todas as colunas tenham IDs
  const safeTableColumns = useMemo(() => {
    return tableColumns.map((col, index) => {
      if (!col.id) {
        console.warn(`Coluna sem ID detectada no índice ${index}:`, col);
        return {
          ...col,
          id: `column_${index}`, // Fallback para ID baseado no índice
        };
      }
      return col;
    });
  }, [tableColumns]);

  const table = useReactTable({
    data,
    columns: safeTableColumns, // Usar colunas verificadas em vez de tableColumns
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: enableRowSelection,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: defaultPageSize,
      },
    },
  })

  const selectedRowIds = useMemo(() => {
    const selection = table.getState().rowSelection as Record<string, boolean>;
    const ids: string[] = [];
    console.log('Debug - selection state:', selection);
    table.getRowModel().rows.forEach((row, index) => {
      const isSelected = selection[row.id];
      console.log(`Debug - row ${index}:`, { 
        rowId: row.id, 
        isSelected, 
        original: row.original,
        hasId: !!row.original?.id,
        hasIdOperacao: !!row.original?.IdOperacao
      });
      if (isSelected) {
        const raw = row.original;
        const id = getRowId ? getRowId(raw) : (raw.id || raw.IdOperacao || row.id);
        console.log('Debug - extracted id:', id);
        if (id) ids.push(String(id));
      }
    });
    console.log('Debug - final selectedRowIds:', ids);
    return ids;
  }, [table, getRowId]);

  // Função alternativa para obter IDs selecionados
  const getAlternativeSelectedIds = useCallback(() => {
    const selection = table.getState().rowSelection as Record<string, boolean>;
    const ids: string[] = [];
    Object.keys(selection).forEach(rowIndex => {
      if (selection[rowIndex]) {
        const row = table.getRowModel().rows[parseInt(rowIndex)];
        if (row) {
          const raw = row.original;
          const id = getRowId ? getRowId(raw) : (raw.id || raw.IdOperacao || rowIndex);
          if (id) ids.push(String(id));
        }
      }
    });
    return ids;
  }, [table, getRowId]);

  // Estados
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    if (defaultVisibleColumns) {
      return columns.reduce((acc, col) => {
        acc[col.key] = defaultVisibleColumns.includes(col.key);
        return acc;
      }, {} as Record<string, boolean>);
    }
    return columns.reduce((acc, col) => {
      acc[col.key] = true;
      return acc;
    }, {} as Record<string, boolean>);
  });

  const [filterModalColumn, setFilterModalColumn] = useState<string | null>(null);

  // Adicionar estado para controlar o nome do arquivo de exportação
  const [exportFilename, setExportFilename] = useState<string>(title ? title.replace(/\s+/g, '_').toLowerCase() : 'dados_exportados');

  // Colunas visíveis
  const visibleColumnsArray = useMemo(() => 
    columns.filter(col => visibleColumns[col.key]), 
    [columns, visibleColumns]
  );

  // Dados filtrados localmente (se não houver callback de filtro externo)
  const filteredData = useMemo(() => {
    if (onFilter) return data; // Se tem callback externo, não filtra localmente
    
    let filtered = [...data];
    
    columnFilters.forEach((filter) => {
      if (filter.value) {
        filtered = filtered.filter(row => {
          const value = row[filter.id];
          return value?.toString().toLowerCase().includes(String(filter.value).toLowerCase());
        });
      }
    });

    return filtered;
  }, [data, columnFilters, onFilter]);

  // Dados ordenados
  const sortedData = useMemo(() => {
    if (!sorting.length) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sorting[0].id];
      const bVal = b[sorting[0].id];
      
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      const direction = sorting[0].desc ? 1 : -1;
      
      if (typeof aVal === "number" && typeof bVal === "number") {
        return (aVal - bVal) * direction;
      }
      
      return aVal.toString().localeCompare(bVal.toString()) * direction;
    });
  }, [filteredData, sorting]);

  // Paginação
  const totalPages = Math.ceil((totalRecords || sortedData.length) / pageSize);
  const startIndex = ((currentPage - 1) * pageSize) + 1;
  const endIndex = Math.min(currentPage * pageSize, totalRecords || sortedData.length);

  // Handlers para paginação
  const handlePageChange = useCallback((newPage: number) => {
    table.setPageIndex(newPage - 1);
    onPageChange?.(newPage);
  }, [table, onPageChange]);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    table.setPageSize(newPageSize);
    onPageSizeChange?.(newPageSize);
  }, [table, onPageSizeChange]);

  // Handlers
  const handleSort = useCallback((columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable || !enableSorting) return;

    const newDirection = 
      sorting.length > 0 && sorting[0].id === columnKey && sorting[0].desc
        ? false
        : true;
    
    setSorting([{ id: columnKey, desc: newDirection }]);
    onSort?.(columnKey, newDirection ? "asc" : "desc");
  }, [columns, sorting, onSort, enableSorting]);

  const handleColumnFilter = useCallback((columnKey: string, value: string) => {
    const newFilters = { ...columnFilters, [columnKey]: value };
    if (!value) {
      delete newFilters[columnKey as keyof typeof newFilters];
    }
    
    setColumnFilters(newFilters);
    onFilter?.(newFilters as unknown as Record<string, string>);
  }, [columnFilters, onFilter]);

  const handleToggleColumn = useCallback((columnKey: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  }, []);

  const handleShowAllColumns = useCallback(() => {
    setVisibleColumns(columns.reduce((acc, col) => {
      acc[col.key] = true;
      return acc;
    }, {} as Record<string, boolean>));
  }, [columns]);

  // Handler para exportação
  const handleExport = useCallback(() => {
    if (onExport) {
      onExport();
    } else {
      // Exportação padrão para CSV
      const csvContent = [
        columns.map(col => col.title).join(','),
        ...table.getFilteredRowModel().rows.map(row => 
          columns.map(col => row.getValue(col.key) || '').join(',')
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${exportFilename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [onExport, columns, table, exportFilename]);

  // Filtros avançados por coluna
  const renderColumnFilter = (column: any) => {
    const columnId = column.id
    const uniqueValues = Array.from(table.getColumn(columnId)?.getFacetedUniqueValues()?.keys() ?? [])
    const currentFilter = filterStates[columnId] || ""
    const filteredValues = uniqueValues.filter((value: any) => 
      value && value.toString().toLowerCase().includes(currentFilter.toLowerCase())
    )

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder={`Filtrar ${column.columnDef.header}...`}
            value={currentFilter}
            onChange={(e) => {
              const value = e.target.value
              setFilterStates(prev => ({
                ...prev,
                [columnId]: value
              }))
            }}
            className="h-8 text-xs"
          />
        </div>
        
        <Select
          value={(column.getFilterValue() as string) || "all"}
          onValueChange={(value) => {
            column.setFilterValue(value === "all" ? undefined : value)
          }}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {filteredValues.map((value: any) => (
              <SelectItem key={value} value={value}>
                {value} ({table.getColumn(columnId)?.getFacetedUniqueValues()?.get(value) || 0})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  // Controles de paginação avançados
  const renderPaginationControls = () => {
    const currentPage = table.getState().pagination.pageIndex + 1
    const totalPages = table.getPageCount()
    const totalRows = table.getFilteredRowModel().rows.length
    const pageSize = table.getState().pagination.pageSize
    const startRow = (currentPage - 1) * pageSize + 1
    const endRow = Math.min(currentPage * pageSize, totalRows)

    return (
      <div className="flex items-center justify-between gap-4 py-4 px-6 bg-gray-50 dark:bg-gray-800/50 border-t">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando {startRow} a {endRow} de {totalRows} registros
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Linhas por página:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                handlePageSizeChange(Number(value))
              }}
            >
              <SelectTrigger className="h-8 w-16 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={!table.getCanPreviousPage()}
            className="h-8 w-8 p-0"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!table.getCanPreviousPage()}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Página {currentPage} de {totalPages}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!table.getCanNextPage()}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={!table.getCanNextPage()}
            className="h-8 w-8 p-0"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  // Filtros ativos
  const activeFilters = columnFilters.filter(filter => filter.value !== undefined)
  
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="text-center text-red-500">
            Erro ao carregar dados: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Cabeçalho */}
      {(title || description) && (
        <div className="mb-6 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          {title && (
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Paginação Superior */}
      {enablePagination && (
        <div className="mb-4">
          {renderPaginationControls()}
        </div>
      )}

      {/* Controles de Filtro e Pesquisa */}
      <div className="flex items-center justify-between gap-4 py-4 px-6 bg-white dark:bg-gray-800 border-b">
        <div className="flex items-center gap-4 flex-1">
          {/* Busca Global */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={searchPlaceholder}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtros Ativos */}
          {activeFilters.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Filtros:</span>
              {activeFilters.map((filter) => (
                <Badge
                  key={filter.id}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  <span className="text-xs">{filter.id}: {filter.value as string}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => {
                      table.getColumn(filter.id)?.setFilterValue(undefined)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Exportação */}
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>

          {/* Filtros por Coluna */}
          {showFilters && enableFiltering && showFiltersControl && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className={`h-4 w-4 ${showFilterText ? 'mr-2' : ''}`} />
                  {showFilterText && (<>Filtros ({activeFilters.length})</>)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>Filtros por Coluna</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-96 overflow-y-auto">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanFilter())
                    .map((column) => (
                      <div key={column.id} className="p-3 border-b last:border-b-0">
                        <div className="font-medium text-sm mb-2 text-gray-700 dark:text-gray-300">
                          {column.columnDef.header as string}
                        </div>
                        {renderColumnFilter(column)}
                      </div>
                    ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Visibilidade das Colunas */}
          {enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Colunas
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Visibilidade das Colunas</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.columnDef.header as string}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Ações de seleção - aparece quando há linhas selecionadas */}
      {enableRowSelection && (Object.keys(table.getState().rowSelection).length > 0 || selectedRowIds.length > 0) && (
        <div className="mb-4 rounded-lg border bg-orange-50 p-4 dark:bg-orange-950/20 dark:border-orange-800">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                {Object.keys(table.getState().rowSelection).length} registro{Object.keys(table.getState().rowSelection).length > 1 ? "s" : ""} selecionado{Object.keys(table.getState().rowSelection).length > 1 ? "s" : ""}
              </Badge>
              <div className="text-sm text-orange-700 dark:text-orange-300">
                Use os botões ao lado para gerenciar a seleção
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => table.resetRowSelection()}>
                Limpar seleção
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    Excluir selecionados ({Object.keys(table.getState().rowSelection).length})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Você está prestes a excluir {Object.keys(table.getState().rowSelection).length} registro(s). Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                      const idsToDelete = getAlternativeSelectedIds();
                      console.log('Deleting IDs:', idsToDelete);
                      onDeleteSelected?.(idsToDelete);
                    }}>
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-50 dark:bg-gray-800/50">
                {enableRowSelection && (
                  <TableHead className="py-4 px-6 w-10">
                    <Checkbox
                      aria-label="Selecionar todos"
                      checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() ? "indeterminate" as any : false)}
                      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    />
                  </TableHead>
                )}
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort() && enableSorting
                  const isSorted = header.column.getIsSorted()
                  
                  return (
                    <TableHead 
                      key={header.id} 
                      className="py-4 px-6 font-semibold text-gray-700 dark:text-gray-300"
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-2">
                          {canSort ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 p-0 hover:bg-transparent"
                              onClick={() => header.column.toggleSorting()}
                            >
                              <div className="flex items-center gap-1">
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                                {isSorted === "desc" ? (
                                  <ArrowDown className="h-4 w-4" />
                                ) : isSorted === "asc" ? (
                                  <ArrowUp className="h-4 w-4" />
                                ) : (
                                  <ArrowUpDown className="h-4 w-4 opacity-50" />
                                )}
                              </div>
                            </Button>
                          ) : (
                            flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )
                          )}
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    "transition-colors",
                    row.getIsSelected()
                      ? "bg-red-300 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  )}
                  onClick={(e) => {
                    const target = e.target as HTMLElement
                    if (target.closest("input,button,a,[role=button]")) return
                    row.toggleSelected()
                  }}
                >
                  {enableRowSelection && (
                    <TableCell className="py-4 px-6 w-10 border-b border-gray-100 dark:border-gray-700">
                      <Checkbox
                        aria-label="Selecionar linha"
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                      />
                    </TableCell>
                  )}
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id} 
                      className="py-4 px-6 border-b border-gray-100 dark:border-gray-700"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (enableRowSelection ? 1 : 0)} 
                  className="h-32 text-center py-8 text-gray-500 dark:text-gray-400"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-4xl">📊</div>
                    <div className="text-lg font-medium">Nenhum resultado encontrado</div>
                    <div className="text-sm">Tente ajustar os filtros ou termos de busca</div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação Inferior */}
      {enablePagination && renderPaginationControls()}

      {/* Debug: mostrar estado da seleção */}
      {enableRowSelection && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Debug: {selectedRowIds.length} selecionados, rowSelection: {JSON.stringify(table.getState().rowSelection)}
        </div>
      )}
    </div>
  );
} 
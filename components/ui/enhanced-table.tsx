import React, { useState, useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Filter,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface EnhancedTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchColumn?: string;
  searchPlaceholder?: string;
  title?: string;
  description?: string;
  enableFiltering?: boolean;
  enableSorting?: boolean;
  enableColumnVisibility?: boolean;
  enablePagination?: boolean;
  defaultPageSize?: number;
  pageSizeOptions?: readonly number[];
}

// Mapeamento de nomes de colunas para português
const COLUMN_NAMES_MAP: Record<string, string> = {
  // Operações Financeiras
  'description': 'Descrição',
  'type': 'Tipo',
  'amount': 'Valor',
  'date': 'Data',
  'category': 'Categoria', 
  'isTaxable': 'Tributável',
  'isPayroll': 'Gasto com Folha',
  'actions': 'Ações',
  // Campos comuns
  'id': 'ID',
  'value': 'Valor',
  'payee': 'Beneficiário',
  'categoryId': 'Categoria',
  'notes': 'Observações',
  'status': 'Status',
  'createdAt': 'Criado em',
  'updatedAt': 'Atualizado em'
};

// Função para obter nome da coluna em português
const getColumnDisplayName = (columnId: string): string => {
  return COLUMN_NAMES_MAP[columnId] || columnId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

export function EnhancedTable<TData, TValue>({
  columns,
  data,
  searchColumn,
  searchPlaceholder = "Buscar...",
  title,
  description,
  enableFiltering = true,
  enableSorting = true,
  enableColumnVisibility = true,
  enablePagination = true,
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 20, 30, 50, 100],
}: EnhancedTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Estado da paginação gerenciado separadamente
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });

  // Verificação robusta para garantir que todas as colunas tenham IDs
  const safeColumns = useMemo(() => {
    return columns.map((col, index) => {
      if (!col.id) {
        console.warn(`Coluna sem ID detectada no EnhancedTable no índice ${index}:`, col);
        return {
          ...col,
          id: `column_${index}`, // Fallback para ID baseado no índice
        };
      }
      return col;
    });
  }, [columns]);

  const table = useReactTable({
    data,
    columns: safeColumns, // Usar colunas verificadas
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
      pagination,
    },
    manualPagination: false,
  });

  // Filterable columns (excluding actions column)
  const filterableColumns = columns.filter(
    (column) => column.id !== "actions" && "accessorKey" in column && typeof column.accessorKey === "string"
  );

  // Clear all filters
  const clearFilters = () => {
    setGlobalFilter("");
    setColumnFilters([]);
    table.resetColumnFilters();
  };

  const activeFiltersCount = useMemo(() => {
    return columnFilters.length + (globalFilter ? 1 : 0);
  }, [columnFilters.length, globalFilter]);

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      {(title || description) && (
        <div className="space-y-1">
          {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}

      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Left side - Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          {/* Global Search */}
          {enableFiltering && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="pl-9 w-64"
              />
            </div>
          )}

          {/* Column Filters Toggle */}
          {enableFiltering && filterableColumns.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          )}

          {/* Clear Filters */}
          {enableFiltering && activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          )}
        </div>

        {/* Right side - Controls */}
        <div className="flex gap-2 items-center">
          {/* Column Visibility */}
          {enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Colunas
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Colunas visíveis</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {getColumnDisplayName(column.id)}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Page Size Selector */}
          {enablePagination && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Mostrar:</span>
              <Select
                value={`${pagination.pageSize}`}
                onValueChange={(value) => {
                  const newPageSize = Number(value);
                  setPagination({
                    pageIndex: 0, // Reset to first page when changing page size
                    pageSize: newPageSize,
                  });
                }}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Column Filters */}
      <AnimatePresence>
        {enableFiltering && showFilters && filterableColumns.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/50"
          >
            {filterableColumns.map((column) => {
              const columnId = ("accessorKey" in column ? column.accessorKey : column.id) as string;
              
              // Get unique values for this column
              const uniqueValues = Array.from(
                new Set(
                  data.map((item: any) => {
                    const value = item[columnId];
                    if (value === null || value === undefined) return "N/A";
                    return String(value);
                  })
                )
              ).filter(Boolean).sort();

              // Special handling for specific columns
              const isSelectField = ['type', 'category', 'isTaxable', 'isPayroll'].includes(columnId);
              
              return (
                <div key={columnId} className="space-y-1">
                  <label className="text-sm font-medium capitalize">
                    {getColumnDisplayName(columnId)}
                  </label>
                  
                  {isSelectField && uniqueValues.length > 0 ? (
                    <Select
                      value={(table.getColumn(columnId)?.getFilterValue() as string) ?? ""}
                      onValueChange={(value) => {
                        table.getColumn(columnId)?.setFilterValue(value === "all" ? "" : value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Todos ${getColumnDisplayName(columnId).toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {uniqueValues.map((value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="relative">
                      <Input
                        placeholder={`Filtrar ${getColumnDisplayName(columnId).toLowerCase()}...`}
                        value={(table.getColumn(columnId)?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                          table.getColumn(columnId)?.setFilterValue(event.target.value)
                        }
                        className="pr-8"
                      />
                      {uniqueValues.length > 0 && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                              >
                                <ChevronDown className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="max-h-64 overflow-y-auto">
                              <DropdownMenuLabel>Valores disponíveis</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {uniqueValues.slice(0, 20).map((value) => (
                                <DropdownMenuCheckboxItem
                                  key={value}
                                  onSelect={() => {
                                    table.getColumn(columnId)?.setFilterValue(value);
                                  }}
                                >
                                  {value}
                                </DropdownMenuCheckboxItem>
                              ))}
                              {uniqueValues.length > 20 && (
                                <div className="px-2 py-1 text-xs text-muted-foreground">
                                  +{uniqueValues.length - 20} mais...
                                </div>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination - Only show at top */}
      {enablePagination && table.getFilteredRowModel().rows.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Mostrando {table.getRowModel().rows.length} de {table.getFilteredRowModel().rows.length} resultados
            </span>
            {table.getFilteredRowModel().rows.length < data.length && (
              <span>(filtrado de {data.length} total)</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, pageIndex: 0 }))}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">Página</span>
              <span className="text-sm font-medium">
                {pagination.pageIndex + 1} de {table.getPageCount()}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, pageIndex: table.getPageCount() - 1 }))}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = enableSorting && header.column.getCanSort();
                  const sortDirection = header.column.getIsSorted();
                  
                  return (
                    <TableHead key={header.id} className="select-none">
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-2">
                          {canSort ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 hover:bg-transparent"
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              <div className="flex items-center gap-2">
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                                {sortDirection === "asc" ? (
                                  <ArrowUp className="h-4 w-4" />
                                ) : sortDirection === "desc" ? (
                                  <ArrowDown className="h-4 w-4" />
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
                  );
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
                  className="hover:bg-muted/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="text-muted-foreground">Nenhum resultado encontrado</div>
                    {activeFiltersCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        Limpar filtros
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 
import React, { useState, useMemo, useCallback } from "react";
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
  getFacetedRowModel,
  getFacetedUniqueValues,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

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
  showFilterText?: boolean; // novo: controla exibição do texto "Filtros"
  showFiltersControl?: boolean; // novo: controla renderização do botão de filtros
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
  showFilterText = true,
  showFiltersControl = true,
}: EnhancedTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterStates, setFilterStates] = useState<Record<string, string | undefined>>({});
  
  // Estado da paginação gerenciado separadamente
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });

  // Verificação robusta para garantir que todas as colunas tenham IDs
  const enhancedFilterFn = useCallback((row: any, id: string, filterValue: any) => {
    const v = row.getValue(id);
    if (filterValue === undefined || filterValue === null || (Array.isArray(filterValue) && filterValue.length === 0)) {
      return true;
    }
    if (Array.isArray(filterValue)) {
      return filterValue.map(String).includes(String(v ?? ""));
    }
    return String(v ?? "").toLowerCase().includes(String(filterValue).toLowerCase());
  }, []);

  const safeColumns = useMemo(() => {
    return (columns as any[]).map((col, index) => {
      if (!col.id) {
        console.warn(`Coluna sem ID detectada no EnhancedTable no índice ${index}:`, col);
        col = { ...col, id: `column_${index}` };
      }
      if (!col.filterFn) {
        col = { ...col, filterFn: enhancedFilterFn };
      }
      return col;
    });
  }, [columns, enhancedFilterFn]);

  const table = useReactTable({
    data,
    columns: safeColumns, // Usar colunas verificadas
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
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

          {/* Filters Modal Trigger (next to Columns) */}
          {enableFiltering && filterableColumns.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFiltersOpen(true)}
                className="relative"
              >
                <Filter className={`h-4 w-4 ${showFilterText ? "mr-2" : ""}`} />
                {showFilterText && ("Filtros")}
                {activeFiltersCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>

              <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
                <DialogContent className="w-[720px] max-w-[800px] max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Filtros por Coluna</DialogTitle>
                  </DialogHeader>
                  <div className="max-h-[70vh] overflow-y-auto">
                    {table
                      .getAllColumns()
                      .filter((column) => column.getCanFilter() && column.id !== 'type' && column.id !== 'actions')
                      .map((column) => {
                        const columnId = column.id;
                        const uniqueValues = Array.from(table.getColumn(columnId)?.getFacetedUniqueValues()?.keys() ?? []);
                        const currentSearch = filterStates[columnId] || "";
                        const isLikelyDate = /date|createdat|updatedat/i.test(columnId);
                        const isBooleanLike = columnId === 'isTaxable' || columnId === 'isPayroll';
                        const displayValue = (val: any) => {
                          try {
                            if (isLikelyDate) {
                              const d = new Date(val);
                              if (!isNaN(d.getTime())) return d.toLocaleDateString('pt-BR');
                            }
                            if (isBooleanLike) {
                              if (String(val) === 'true') return 'Sim';
                              if (String(val) === 'false') return 'Não';
                            }
                          } catch {}
                          return String(val ?? '');
                        };
                        const filteredValues = uniqueValues.filter((value: any) => 
                          value && displayValue(value).toLowerCase().includes(currentSearch.toLowerCase())
                        );
                        const selectedValues: string[] = Array.isArray(column.getFilterValue()) ? column.getFilterValue() as string[] : [];
                        return (
                          <div key={column.id} className="p-3 border-b last:border-b-0 w-[500px] max-w-[600px] mx-auto">
                            <div className="font-medium text-sm mb-2 text-gray-700 dark:text-gray-300">
                              {getColumnDisplayName(column.id)}
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Search className="h-4 w-4 text-gray-400" />
                                <Input
                                  placeholder={`Filtrar ${getColumnDisplayName(column.id)}...`}
                                  value={currentSearch}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setFilterStates(prev => ({ ...prev, [columnId]: value }));
                                  }}
                                  className="h-8 text-xs"
                                />
                              </div>
                              <div className="max-h-60 overflow-y-auto rounded-md border p-2 space-y-1">
                                <div className="flex items-center justify-between mb-2">
                                  <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => column.setFilterValue(undefined)}>Limpar</Button>
                                  <span className="text-xs text-gray-500">{selectedValues.length} selecionado(s)</span>
                                </div>
                                {filteredValues.map((value: any) => {
                                  const valStr = String(value);
                                  const checked = selectedValues.includes(valStr);
                                  return (
                                    <label key={valStr} className="flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                                      <Checkbox
                                        checked={checked}
                                        onCheckedChange={(isChecked) => {
                                          const next = new Set(selectedValues);
                                          if (isChecked) next.add(valStr); else next.delete(valStr as any);
                                          column.setFilterValue(Array.from(next));
                                        }}
                                      />
                                      <span className="text-sm flex-1">
                                        {displayValue(valStr)} ({table.getColumn(columnId)?.getFacetedUniqueValues()?.get(value) || 0})
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </DialogContent>
              </Dialog>
            </>
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

      {/* Inline Column Filters removed in favor of modal */}

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
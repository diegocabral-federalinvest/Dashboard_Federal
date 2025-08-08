"use client"

import { useState, useMemo } from "react"
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

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu, 
  DropdownMenuCheckboxItem, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  ArrowUpDown, 
  ArrowDown, 
  ArrowUp,
  X,
  Search,
  ChevronsLeft,
  ChevronsRight,
  Settings,
  Download,
  FileText,
  FileSpreadsheet
} from "lucide-react"

interface AdvancedInvestmentTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  className?: string
  title?: string
  description?: string
  onExport?: (format: 'csv' | 'excel', data: TData[]) => void
}

interface FilterState {
  [key: string]: string | undefined
}

export function AdvancedInvestmentTable<TData, TValue>({
  columns,
  data,
  className,
  title,
  description,
  onExport,
}: AdvancedInvestmentTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [filterStates, setFilterStates] = useState<FilterState>({})
  const [globalFilter, setGlobalFilter] = useState("")

  // Verificação robusta para garantir que todas as colunas tenham IDs
  const safeColumns = useMemo(() => {
    return columns.map((col, index) => {
      if (!col.id) {
        console.warn(`Coluna sem ID detectada no AdvancedInvestmentTable no índice ${index}:`, col);
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
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
        pageSize: 10,
      },
    },
  })

  // Gera valores únicos para filtros
  const generateUniqueValues = (columnId: string) => {
    const uniqueValues = Array.from(table.getColumn(columnId)?.getFacetedUniqueValues()?.keys() ?? [])
    return uniqueValues.sort()
  }

  // Filtros avançados por coluna
  const renderColumnFilter = (column: any) => {
    const columnId = column.id
    const uniqueValues = generateUniqueValues(columnId)
    
    if (uniqueValues.length === 0) return null

    const currentFilter = filterStates[columnId] || ""
    const filteredValues = uniqueValues.filter((value: any) => 
      value && value.toString().toLowerCase().includes(currentFilter.toLowerCase())
    )

    return (
      <div className="space-y-3 p-3">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder={`Buscar ${column.columnDef.header}...`}
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
      <div className="flex items-center justify-between gap-4 py-4 px-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Mostrando <span className="font-bold text-blue-600 dark:text-blue-400">{startRow}</span> a <span className="font-bold text-blue-600 dark:text-blue-400">{endRow}</span> de <span className="font-bold text-blue-600 dark:text-blue-400">{totalRows}</span> registros
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Linhas por página:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-8 w-20 text-xs border-2 border-blue-200 dark:border-blue-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 30, 50, 100].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="h-9 w-9 p-0 border-2 border-blue-200 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50"
            title="Primeira página"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-9 w-9 p-0 border-2 border-blue-200 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50"
            title="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-600 rounded-lg">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Página <span className="font-bold text-blue-600 dark:text-blue-400">{currentPage}</span> de <span className="font-bold text-blue-600 dark:text-blue-400">{totalPages}</span>
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-9 w-9 p-0 border-2 border-blue-200 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50"
            title="Próxima página"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="h-9 w-9 p-0 border-2 border-blue-200 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50"
            title="Última página"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  // Filtros ativos
  const activeFilters = columnFilters.filter(filter => filter.value !== undefined)
  
  // Export functions
  const handleExport = (format: 'csv' | 'excel') => {
    const visibleData = table.getFilteredRowModel().rows.map(row => row.original)
    onExport?.(format, visibleData)
  }

  return (
    <div className={className}>
      {/* Cabeçalho */}
      {(title || description) && (
        <div className="mb-6 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-700 shadow-sm">
          {title && (
            <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">
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
      <div className="mb-6">
        {renderPaginationControls()}
      </div>

      {/* Controles de Filtro e Pesquisa */}
      <div className="flex items-center justify-between gap-4 py-4 px-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-lg shadow-sm mb-4">
        <div className="flex items-center gap-4 flex-1">
          {/* Busca Global */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="🔍 Buscar em todas as colunas..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10 border-2 border-blue-200 dark:border-blue-600 focus:border-blue-400 dark:focus:border-blue-500"
            />
          </div>

          {/* Filtros Ativos */}
          {activeFilters.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Filtros ativos:</span>
              <div className="flex flex-wrap gap-1">
                {activeFilters.map((filter) => (
                  <Badge
                    key={filter.id}
                    variant="secondary"
                    className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-600"
                  >
                    <span className="text-xs font-medium">{filter.id}: {filter.value as string}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-blue-200 dark:hover:bg-blue-800"
                      onClick={() => {
                        table.getColumn(filter.id)?.setFilterValue(undefined)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Filtros por Coluna */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-2 border-blue-200 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50">
                <Filter className="mr-2 h-4 w-4" />
                Filtros Avançados ({activeFilters.length})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
              <DropdownMenuLabel className="text-base font-semibold">Filtros por Coluna</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanFilter())
                .map((column) => (
                  <div key={column.id} className="border-b last:border-b-0">
                    <div className="font-medium text-sm py-2 px-3 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      {column.columnDef.header as string}
                    </div>
                    {renderColumnFilter(column)}
                  </div>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Exportar */}
          {onExport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-2 border-green-200 dark:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/50">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Exportar Dados Filtrados</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleExport('csv')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Exportar como CSV
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleExport('excel')}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Exportar como Excel
                </Button>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Visibilidade das Colunas */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-2 border-purple-200 dark:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/50">
                <Settings className="mr-2 h-4 w-4" />
                Colunas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-base font-semibold">Visibilidade das Colunas</DropdownMenuLabel>
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
        </div>
      </div>

      {/* Tabela Principal */}
      <div className="border-2 border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b-2 border-gray-200 dark:border-gray-600">
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const isSorted = header.column.getIsSorted()
                  
                  return (
                    <TableHead 
                      key={header.id} 
                      className="py-5 px-6 font-bold text-gray-800 dark:text-gray-200 text-sm"
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-2">
                          {canSort ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 p-1 hover:bg-blue-100 dark:hover:bg-blue-900/50 font-bold"
                              onClick={() => header.column.toggleSorting()}
                            >
                              <div className="flex items-center gap-2">
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                                {isSorted === "desc" ? (
                                  <ArrowDown className="h-4 w-4 text-blue-600" />
                                ) : isSorted === "asc" ? (
                                  <ArrowUp className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <ArrowUpDown className="h-4 w-4 opacity-50 hover:opacity-100 transition-opacity" />
                                )}
                              </div>
                            </Button>
                          ) : (
                            <div className="font-bold">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </div>
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
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 ${
                    index % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800'
                  } border-b border-gray-100 dark:border-gray-700`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id} 
                      className="py-4 px-6 text-sm"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell 
                  colSpan={columns.length} 
                  className="h-32 text-center py-8 text-gray-500 dark:text-gray-400"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-6xl">📊</div>
                    <div className="text-xl font-semibold">Nenhum resultado encontrado</div>
                    <div className="text-sm text-gray-400">Tente ajustar os filtros ou termos de busca</div>
                    {(globalFilter || activeFilters.length > 0) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setGlobalFilter("")
                          setColumnFilters([])
                        }}
                        className="mt-2"
                      >
                        Limpar todos os filtros
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação Inferior */}
      <div className="mt-6">
        {renderPaginationControls()}
      </div>
    </div>
  )
} 
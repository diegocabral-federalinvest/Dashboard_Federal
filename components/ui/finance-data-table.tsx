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
  Row,
  RowSelectionState
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import useConfirm from "@/hooks/use-confirm"
import { 
  ArrowDownUp, 
  ArrowUp,
  ArrowDown,
  Calendar, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  RefreshCw, 
  Save, 
  Sliders, 
  Trash2,
  X,
  Download 
} from "lucide-react"
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
// import { Separator } from "@/components/ui/separator" // Removido pois não está sendo usado
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { SelectionActionBar } from "@/components/ui/selection-action-bar"

interface FinanceDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey: string
  onDelete?: (rows: Row<TData>[]) => void
  onExport?: (rows: Row<TData>[]) => void
  onRefresh?: () => void
  dateField?: string
  valueField?: string
  isLoading?: boolean
  title?: string
  description?: string
}

export function FinanceDataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  onDelete,
  onExport,
  onRefresh,
  dateField = "date",
  valueField = "value",
  isLoading = false,
  title,
  description
}: FinanceDataTableProps<TData, TValue>) {
  // Estado da tabela
  const [sorting, setSorting] = useState<SortingState>([{ id: dateField, desc: true }]); // Ordenar por data desc padrão
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState<string>("")
  
  // Estado dos filtros avançados
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [valueRange, setValueRange] = useState<{min?: string, max?: string}>({})
  const [showFilters, setShowFilters] = useState(false)
  
  // Dialog de confirmação
  const [ConfirmDialog, confirm] = useConfirm(
    "Confirmar exclusão",
    "Tem certeza que deseja excluir os itens selecionados?"
  )

  // Verificação robusta para garantir que todas as colunas tenham IDs
  const safeColumns = useMemo(() => {
    return columns.map((col, index) => {
      if (!col.id) {
        console.warn(`Coluna sem ID detectada no FinanceDataTable no índice ${index}:`, col);
        return {
          ...col,
          id: `column_${index}`, // Fallback para ID baseado no índice
        };
      }
      return col;
    });
  }, [columns]);

  // Configurar a tabela
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
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    enableRowSelection: true,
  })

  // Aplicar filtros adicionais
  const applyFilters = () => {
    // Filtrar por data
    if (dateRange?.from && dateField) {
      table.getColumn(dateField)?.setFilterValue((old: { from?: Date, to?: Date }) => {
        const range = {...old, from: dateRange.from, to: dateRange.to || dateRange.from}
        return range
      })
    }
    
    // Filtrar por valor
    if ((valueRange.min || valueRange.max) && valueField) {
      table.getColumn(valueField)?.setFilterValue((old: { min?: number, max?: number }) => {
        return {
          ...old,
          min: valueRange.min ? parseFloat(valueRange.min) : undefined,
          max: valueRange.max ? parseFloat(valueRange.max) : undefined
        }
      })
    }
    
    setShowFilters(false)
  }
  
  // Limpar filtros
  const clearFilters = () => {
    setDateRange(undefined)
    setValueRange({})
    setColumnFilters([])
    setGlobalFilter("")
    setShowFilters(false)
  }

  // Função para exportar em diferentes formatos - modificada para passar o formato
  const handleExport = (rows: Row<TData>[], format: "pdf" | "csv" | "excel") => {
    console.log(`Exportando ${rows.length} itens no formato ${format}`);
    
    // Estamos chamando onExport diretamente, mas precisamos adaptar para o tipo correto
    // A interface diz que onExport só recebe rows, mas SelectionActionBar precisa do formato
    // Usamos uma abordagem de casting aqui para ajustar os tipos
    const exportWithFormat = onExport as unknown as (rows: Row<TData>[], format: "pdf" | "csv" | "excel") => void;
    
    // Tenta chamar com o formato se possível, caso contrário usa o padrão
    if (exportWithFormat) {
      exportWithFormat(rows, format);
    } else if (onExport) {
      onExport(rows);
    }
  };

  return (
    <Card className="border-none shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 mt-8 transition-all duration-300 ease-in-out">
      <ConfirmDialog />
      
      {(title || description) && (
        <CardHeader className="px-0 pb-4 mb-4 border-b dark:border-slate-700">
          {title && <CardTitle className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">{title}</CardTitle>}
          {description && <CardDescription className="text-sm sm:text-base text-slate-600 dark:text-slate-400">{description}</CardDescription>}
        </CardHeader>
      )}
      
      <CardContent className="p-0">
        {/* Barra de ferramentas */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-4">
          {/* Input de busca */}
          <div className="relative w-full sm:w-auto sm:flex-1 max-w-md">
            <Input
              placeholder="Buscar em todas as colunas..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10 pr-8 rounded-md border-slate-300 dark:border-slate-700 focus:border-primary dark:focus:border-primary transition-colors duration-200 h-10 text-sm"
            />
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
            {globalFilter && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setGlobalFilter("")}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Ações em grupo */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Botão de filtros avançados */}
            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={cn(
                    "gap-1.5 h-10 text-sm rounded-md border-slate-300 dark:border-slate-700 hover:border-primary dark:hover:border-primary",
                    (dateRange || valueRange.min || valueRange.max) && "border-primary text-primary dark:border-primary dark:text-primary"
                  )}
                >
                  <Sliders className="h-4 w-4" />
                  <span className="hidden md:inline">Filtros</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg shadow-xl">
                <div className="space-y-4 p-1">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200">Filtros Avançados</h4>
                  
                  {/* Filtro de data */}
                  {dateField && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">Período</h5>
                      <DatePickerWithRange 
                        date={dateRange} 
                        setDate={setDateRange} 
                        locale={ptBR}
                        className="w-full"
                      />
                    </div>
                  )}
                  
                  {/* Filtro de valor */}
                  {valueField && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">Faixa de Valor</h5>
                      <div className="flex gap-2">
                        <Input 
                          type="number" 
                          placeholder="Mínimo" 
                          value={valueRange.min || ""}
                          onChange={(e) => setValueRange({...valueRange, min: e.target.value})}
                          className="flex-1 rounded-md border-slate-300 dark:border-slate-600 focus:border-primary dark:focus:border-primary transition-colors duration-200 h-9 text-sm"
                        />
                        <Input 
                          type="number" 
                          placeholder="Máximo" 
                          value={valueRange.max || ""}
                          onChange={(e) => setValueRange({...valueRange, max: e.target.value})}
                          className="flex-1 rounded-md border-slate-300 dark:border-slate-600 focus:border-primary dark:focus:border-primary transition-colors duration-200 h-9 text-sm"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2 pt-2">
                    <Button 
                      variant="ghost"
                      size="sm" 
                      onClick={clearFilters}
                      className="text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-md"
                    >
                      Limpar
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={applyFilters}
                      className="bg-primary hover:bg-primary/90 text-white rounded-md"
                    >
                      Aplicar Filtros
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Dropdown de colunas */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 h-10 text-sm rounded-md border-slate-300 dark:border-slate-700 hover:border-primary dark:hover:border-primary">
                  <ChevronDown className="h-4 w-4" />
                  <span className="hidden md:inline">Colunas</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[220px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg shadow-xl">
                <DropdownMenuLabel className="font-semibold text-slate-800 dark:text-slate-200">Exibir/Ocultar Colunas</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700"/>
                {table
                  .getAllColumns()
                  .filter(column => column.getCanHide())
                  .map(column => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize text-sm text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-700"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {/* Substituir IDs por nomes mais amigáveis, se possível */}
                        {column.id === 'description' ? 'Descrição' :
                         column.id === 'value' ? 'Valor' :
                         column.id === 'date' ? 'Data' :
                         column.id === 'isTaxable' ? 'Tributável' :
                         column.id === 'actions' ? 'Ações' :
                         column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Botão de atualizar */}
            {onRefresh && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onRefresh}
                className="gap-1.5 h-10 text-sm rounded-md border-slate-300 dark:border-slate-700 hover:border-primary dark:hover:border-primary"
                disabled={isLoading}
              >
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                <span className="hidden md:inline">{isLoading ? "Atualizando..." : "Atualizar"}</span>
              </Button>
            )}
            {/* Botão de exportar - Movido para fora da condição de seleção */}
            {onExport && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 h-10 text-sm rounded-md border-slate-300 dark:border-slate-700 hover:border-primary dark:hover:border-primary"
                    disabled={table.getFilteredRowModel().rows.length === 0 && table.getFilteredSelectedRowModel().rows.length === 0}
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden md:inline">Exportar</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg shadow-xl">
                  <DropdownMenuItem
                    onClick={() => handleExport(table.getFilteredSelectedRowModel().rows.length > 0 ? table.getFilteredSelectedRowModel().rows : table.getFilteredRowModel().rows, "csv")}
                    disabled={table.getFilteredRowModel().rows.length === 0 && table.getFilteredSelectedRowModel().rows.length === 0}
                    className="text-sm text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-700"
                  >
                    Exportar CSV ({table.getFilteredSelectedRowModel().rows.length > 0 ? table.getFilteredSelectedRowModel().rows.length : table.getFilteredRowModel().rows.length})
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleExport(table.getFilteredSelectedRowModel().rows.length > 0 ? table.getFilteredSelectedRowModel().rows : table.getFilteredRowModel().rows, "excel")}
                    disabled={table.getFilteredRowModel().rows.length === 0 && table.getFilteredSelectedRowModel().rows.length === 0}
                    className="text-sm text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-700"
                  >
                    Exportar Excel ({table.getFilteredSelectedRowModel().rows.length > 0 ? table.getFilteredSelectedRowModel().rows.length : table.getFilteredRowModel().rows.length})
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleExport(table.getFilteredSelectedRowModel().rows.length > 0 ? table.getFilteredSelectedRowModel().rows : table.getFilteredRowModel().rows, "pdf")}
                    disabled={table.getFilteredRowModel().rows.length === 0 && table.getFilteredSelectedRowModel().rows.length === 0}
                    className="text-sm text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-700"
                  >
                    Exportar PDF ({table.getFilteredSelectedRowModel().rows.length > 0 ? table.getFilteredSelectedRowModel().rows.length : table.getFilteredRowModel().rows.length})
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        
        {/* Tabela */}
        <div className="rounded-lg border dark:border-slate-700 shadow-md overflow-hidden bg-white dark:bg-slate-800/50">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b dark:border-slate-700">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1 cursor-pointer select-none">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {{
                          asc: <ArrowUp className="h-3 w-3" />,
                          desc: <ArrowDown className="h-3 w-3" />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="divide-y dark:divide-slate-700">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
                      <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                      <span>Carregando dados...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150",
                      row.getIsSelected() && "bg-primary/10 dark:bg-primary/20"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center text-slate-500 dark:text-slate-400">
                    Nenhum resultado encontrado para os filtros aplicados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Paginação e informações */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-4 mt-4 border-t dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400 order-2 sm:order-1">
            {table.getFilteredSelectedRowModel().rows.length > 0 ? (
              <>
                <span className="font-semibold text-primary">{table.getFilteredSelectedRowModel().rows.length}</span> de{" "}
                <span className="font-semibold">{table.getFilteredRowModel().rows.length}</span> linha(s) selecionada(s).
              </>
            ) : (
              <>
                Exibindo{" "}
                <span className="font-semibold">{table.getRowModel().rows.length}</span> de{" "}
                <span className="font-semibold">{data.length}</span> registro(s) no total.
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto justify-center sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="h-9 w-9 p-0 rounded-md border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ChevronLeft className="h-4 w-4" />
              <ChevronLeft className="h-4 w-4 -ml-2" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-9 w-9 p-0 rounded-md border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Pág {table.getState().pagination.pageIndex + 1} de{" "}
              {table.getPageCount() || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-9 w-9 p-0 rounded-md border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
             <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="h-9 w-9 p-0 rounded-md border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ChevronRight className="h-4 w-4" />
              <ChevronRight className="h-4 w-4 -ml-2" />
            </Button>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-9 w-[75px] rounded-md border-slate-300 dark:border-slate-600 text-sm">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-md">
                {[10, 25, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()} className="text-sm focus:bg-slate-100 dark:focus:bg-slate-700">
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Barra de ações fixa para itens selecionados */}
        <SelectionActionBar
          selectedRows={table.getFilteredSelectedRowModel().rows}
          onDelete={onDelete}
          onExport={handleExport}
          onClearSelection={() => table.resetRowSelection()}
        />
      </CardContent>
    </Card>
  )
}
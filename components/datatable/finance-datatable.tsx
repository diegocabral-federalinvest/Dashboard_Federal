import React, { useState, useMemo } from "react";
import { 
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  Download, 
  FileDown, 
  Filter, 
  MoreHorizontal, 
  RotateCcw, 
  Trash
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  onDelete?: (selectedRows: TData[]) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function FinanceDataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  onDelete,
  onRefresh,
  isLoading
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

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

  // Handle the table state
  const table = useReactTable({
    data,
    columns: safeColumns, // Usar colunas verificadas
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Function to export data to CSV
  const exportToCSV = () => {
    // Get visible rows
    const rows = table.getFilteredRowModel().rows;
    if (rows.length === 0) {
      toast.error("Não há dados para exportar");
      return;
    }
    
    // Extract column headers
    const headers = columns
      .filter(column => column.id !== "select")
      .map(column => {
        return (column.header as string) || column.id;
      });
    
    // Extract row data
    const csvData = rows.map(row => {
      return columns
        .filter(column => column.id !== "select")
        .map(column => {
          const cell = row.getVisibleCells().find(cell => cell.column.id === column.id);
          let value = cell?.getValue();
          
          // Format dates
          if (value instanceof Date) {
            value = format(value, 'dd/MM/yyyy', { locale: ptBR });
          }
          
          // Format numbers
          if (typeof value === 'number') {
            value = value.toString().replace('.', ',');
          }
          
          // Wrap in quotes if contains comma
          if (typeof value === 'string' && value.includes(',')) {
            value = `"${value}"`;
          }
          
          return value;
        })
        .join(',');
    });
    
    // Create CSV content
    const csv = [headers.join(','), ...csvData].join('\n');
    
    // Create and trigger download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `dados_${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Dados exportados com sucesso");
  };

  // Function to handle deletion of selected rows
  const handleDelete = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original);
    
    if (selectedRows.length === 0) {
      toast.error("Nenhum item selecionado para exclusão");
      return;
    }
    
    onDelete?.(selectedRows);
    setRowSelection({});
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        {searchKey && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              placeholder="Buscar..."
              value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn(searchKey)?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          </div>
        )}
        <div className="flex items-center gap-2 ml-auto">
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            disabled={isLoading || table.getFilteredRowModel().rows.length === 0}
          >
            <FileDown className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isLoading || table.getFilteredSelectedRowModel().rows.length === 0}
            >
              <Trash className="h-4 w-4 mr-2" />
              Excluir {table.getFilteredSelectedRowModel().rows.length > 0 && 
                `(${table.getFilteredSelectedRowModel().rows.length})`}
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Colunas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter(column => column.getCanHide())
                .map(column => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
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
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {isLoading ? "Carregando..." : "Nenhum resultado encontrado."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <p>
              {table.getFilteredSelectedRowModel().rows.length} de{" "}
              {table.getFilteredRowModel().rows.length} itens selecionados
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 
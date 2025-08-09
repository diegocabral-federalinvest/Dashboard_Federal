//app/(dashboard)/operacoes/client.tsx
"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// DataTable substituída pela EnhancedTable
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { SimpleLineChart } from "@/components/charts/simple-line-chart";
import { SimpleBarChart } from "@/components/charts/simple-bar-chart";
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  MoreHorizontal,
  Edit,
  Trash2,
  ArrowUpDown,
  PieChart,
  BarChart3,
  Activity,
  LineChart
} from "lucide-react";
import { formatCurrency, formatSafeDate } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useHeaderContent } from "@/hooks/use-header-content";
import useConfirm from "@/hooks/use-confirm";
import { toast } from "sonner";


// Delete mutations são importadas dos hooks modulares

// Import sheet hooks
import { useNewExpense } from "@/features/expenses/hooks/use-new-expense";
import { useOpenExpense } from "@/features/expenses/hooks/use-open-expense";
import { useNewEntry } from "@/features/entries/hooks/use-new-entry";
import { useOpenEntry } from "@/features/entries/hooks/use-open-entry";

// Import sheet components
import NewExpenseSheet from "@/features/expenses/components/new-expense-sheet";
import EditExpenseSheet from "@/features/expenses/components/edit-expense-sheet";
import NewEntrySheet from "@/features/entries/components/new-entry-sheet";
import EditEntrySheet from "@/features/entries/components/edit-entry-sheet";

// Import modular components and hooks
import { FinancialStatsCards } from "./_components";
import { useProcessedFinancialData, useChartData, useDeleteExpenseOperation, useDeleteEntryOperation } from "./_hooks";
import { CHART_CONFIG, TABLE_CONFIG, DEFAULT_MESSAGES, EXPENSE_CATEGORIES, ENTRY_CATEGORIES } from "./_constants";
import type { FinancialOperation } from "./_types";
import { EnhancedTable } from "@/components/ui/enhanced-table";
import { useSession } from "next-auth/react";
export default function OperacoesClient() {
  const [activeTab, setActiveTab] = useState("overview");
  const user = useSession();
  const userRole = (user?.data?.user as any)?.role;
  const [ConfirmDialog, confirm] = useConfirm(
    "Tem certeza?",
    "Você está prestes a excluir esta transação. Esta ação não pode ser desfeita."
  );

  // Sheet hooks
  const newExpense = useNewExpense();
  const openExpense = useOpenExpense();
  const newEntry = useNewEntry();
  const openEntry = useOpenEntry();

  // Delete mutations que funcionam corretamente
  const deleteExpenseMutation = useDeleteExpenseOperation();
  const deleteEntryMutation = useDeleteEntryOperation();

  // Use modular hooks
  const { 
    summary, 
    allOperations, 
    rawData, 
    isLoading, 
    hasData 
  } = useProcessedFinancialData();

  const {
    dailyFlowData,
    monthlyComparisonData,
    expenseTrendData,
    entryTrendData,
    expenseCategoryData,
    entryCategoryData
  } = useChartData();

  // Set header content
  useHeaderContent({
    title: "Operações Financeiras",
    subtitle: "Gerencie todas as suas transações financeiras",
    pageType: 'default',
    showDefaultActions: true
  });

  // Handle delete
  const handleDelete = async (id: string, type: 'expense' | 'entry') => {
    const ok = await confirm();
    
    if (ok) {
      if (type === 'expense') {
        deleteExpenseMutation.mutate(id);
      } else {
        deleteEntryMutation.mutate(id);
      }
    }
  };

  // Handle edit
  const handleEdit = (id: string, type: 'expense' | 'entry') => {
    if (type === 'expense') {
      openExpense.onOpen(id);
    } else {
      openEntry.onOpen(id);
    }
  };

  // Columns for operations table (base) - movido para dentro do componente para acessar userRole
  const baseColumns: ColumnDef<FinancialOperation>[] = [
    {
      id: "description",
      accessorKey: "description",
      header: "Descrição",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("description") || "Sem descrição"}</div>
      ),
    },
    {
      id: "type",
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => {
        const type = row.getValue("type") || 'expense';
        return (
          <Badge variant={type === 'entry' ? 'default' : 'destructive'} className="font-medium">
            {type === 'entry' ? 'Entrada' : 'Despesa'}
          </Badge>
        );
      },
    },
    {
      id: "amount",
      accessorKey: "amount",
      header: "Valor",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount") || "0");
        const type = row.original.type || 'expense';
        
        return (
          <div className={`font-bold ${type === 'entry' ? 'text-green-600' : 'text-red-600'}`}>
            {type === 'expense' ? '-' : '+'}{formatCurrency(amount)}
          </div>
        );
      },
    },
    {
      id: "date",
      accessorKey: "date",
      header: "Data",
      cell: ({ row }) => {
        const dateValue = row.getValue("date") || new Date().toISOString();
        return <div className="font-medium">{formatSafeDate(dateValue)}</div>;
      },
    },
    {
      id: "category",
      accessorKey: "category",
      header: "Categoria",
      cell: ({ row }) => {
        return <Badge variant="outline">{row.getValue("category") || "Não categorizada"}</Badge>;
      },
    },
    {
      id: "isTaxable",
      accessorKey: "isTaxable",
      header: "Tributável",
      cell: ({ row }) => {
        const operation = row.original;
        if (operation.type === 'entry') return <span className="text-muted-foreground">-</span>;
        
        return (
          <Badge variant={operation.isTaxable ? "default" : "secondary"}>
            {operation.isTaxable ? "Sim" : "Não"}
          </Badge>
        );
      },
    },
    {
      id: "isPayroll",
      accessorKey: "isPayroll",
      header: "Gasto com Folha",
      cell: ({ row }) => {
        const operation = row.original;
        if (operation.type === 'entry') return <span className="text-muted-foreground">-</span>;
        
        return (
          <Badge variant={operation.isPayroll ? "default" : "secondary"}>
            {operation.isPayroll ? "Sim" : "Não"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const operation = row.original;
        
        // Só mostra o botão de ações para admin e editor
        if (userRole !== 'admin' && userRole !== 'editor') {
          return <span className="text-muted-foreground text-sm">-</span>;
        }
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem 
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(operation.id, operation.type);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/50"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(operation.id, operation.type);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Debug helper columns (optional)
  const debugColumns: ColumnDef<FinancialOperation>[] = [
    {
      id: "rawCategoryId",
      header: "rawCategoryId",
      cell: ({ row }) => (
        <code className="text-xs">{String(row.original.rawCategoryId ?? "")}</code>
      ),
    },
    {
      id: "rawIsPayroll",
      header: "rawIsPayroll",
      cell: ({ row }) => (
        <code className="text-xs">{String(row.original.rawIsPayroll)}</code>
      ),
    },
    {
      id: "rawIsTaxable",
      header: "rawIsTaxable",
      cell: ({ row }) => (
        <code className="text-xs">{String(row.original.rawIsTaxable)}</code>
      ),
    },
  ];

  // Compose columns per table context
  const expensesColumns: ColumnDef<FinancialOperation>[] = baseColumns;

  const entriesColumns: ColumnDef<FinancialOperation>[] = (() => {
    const filtered = baseColumns.filter((c) => !["isTaxable", "isPayroll"].includes(String(c.id)));
    return filtered;
  })();

  const allColumns: ColumnDef<FinancialOperation>[] = baseColumns;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">{DEFAULT_MESSAGES.LOADING}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog />
      <NewExpenseSheet />
      <EditExpenseSheet />
      <NewEntrySheet />
      <EditEntrySheet />
      
      <div className="space-y-8 p-4 md:p-6 pb-16">
        {/* Tabs Navigation with Action Buttons */}
        <motion.div 
          className="w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-8">
              <TabsList className="grid grid-cols-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                  <PieChart className="h-4 w-4 mr-2" />
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger value="expenses" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                  <TrendingDown className="h-4 w-4 mr-2" />
                  Despesas
                </TabsTrigger>
                <TabsTrigger value="entries" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Entradas
                </TabsTrigger>
                <TabsTrigger value="all" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Todas
                </TabsTrigger>
              </TabsList>

              {/* Contextual Action Buttons - apenas admin e editor podem ver esses botões */}
              {(userRole === 'admin' || userRole === 'editor') && (
                <div className="flex gap-2">
                  <AnimatePresence mode="wait">
                    {(activeTab === 'expenses' || activeTab === 'all') && (
                      <motion.div
                        key="expense-button"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Button 
                          size="sm"
                          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                          onClick={() => newExpense.onOpen()}
                        >
                          <TrendingDown className="h-4 w-4 mr-2" />
                          Nova Despesa
                        </Button>
                      </motion.div>
                    )}
                    
                    {(activeTab === 'entries' || activeTab === 'all') && (
                      <motion.div
                        key="entry-button"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Button 
                          size="sm"
                          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                          onClick={() => newEntry.onOpen()}
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Nova Entrada
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Enhanced Summary Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, staggerChildren: 0.1, delay: 0.3 }}
            >
              <FinancialStatsCards 
                summary={summary}
                entriesCount={rawData.entries.length}
                expensesCount={rawData.expenses.length}
              />
            </motion.div>
          
          <TabsContent value="overview" className="space-y-8 mt-8">
            <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
              {/* Financial Flow Chart */}
              <GlassCard
                title={
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <span>Fluxo Financeiro (30 dias)</span>
                  </div>
                }
                variant="light"
                elevation="medium"
                className="h-[450px] flex flex-col"
              >
                <div className="p-4 flex-1">
                  <SimpleLineChart
                    data={dailyFlowData}
                    height={CHART_CONFIG.HEIGHT}
                    color={CHART_CONFIG.COLORS.PRIMARY}
                    tooltipLabel="Resultado"
                  />
                </div>
              </GlassCard>

              {/* Monthly Comparison */}
              <GlassCard
                title={
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <span>Comparação Mensal</span>
                  </div>
                }
                variant="light"
                elevation="medium"
                className="h-[450px] flex flex-col"
              >
                <div className="p-4 flex-1">
                  <SimpleBarChart
                    data={monthlyComparisonData}
                    height={CHART_CONFIG.HEIGHT}
                    color={CHART_CONFIG.COLORS.SUCCESS}
                    tooltipLabel="Result"
                  />
                </div>
              </GlassCard>
            </div>

            {/* Recent Operations Overview */}
            <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
              <GlassCard
                title={
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Últimas Entradas</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {rawData.entries.length} entrada{rawData.entries.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                }
                variant="light"
                elevation="medium"
                className="h-[550px] flex flex-col"
              >
                                {/* Área com scroll interno - altura LIMITADA */}
                <div className="p-4">
                  {rawData.entries.length === 0 ? (
                    <div className="text-center py-12 flex flex-col justify-center">
                      <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground text-lg">Nenhuma entrada registrada</p>
                      <p className="text-sm text-muted-foreground mt-2">Clique em &quot;Nova Entrada&quot; para começar</p>
                    </div>
                  ) : (
                    <div className="h-[420px] overflow-y-scroll operations-scroll operations-scroll-entries border border-emerald-200 dark:border-emerald-800 rounded-lg">
                      <div className="space-y-2 p-3 min-h-[450px]">
                        {rawData.entries
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((entry, index) => (
                          <motion.div 
                            key={entry.id}
                            className="flex justify-between items-center p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 border border-emerald-200 dark:border-emerald-700"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: Math.min(index * 0.03, 0.3) }}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {entry.payee || 'Sem descrição'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatSafeDate(entry.date)}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-emerald-600 font-bold text-base">
                                +{formatCurrency(Number(entry.value) || 0)}
                              </div>
                              <Badge variant="outline" className="text-xs text-emerald-700 border-emerald-300 mt-0.5">
                                {ENTRY_CATEGORIES[entry.categoryId as keyof typeof ENTRY_CATEGORIES] || entry.categoryId || 'Sem categoria'}
                              </Badge>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>

              <GlassCard
                title={
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                      <span className="text-red-700 dark:text-red-400 font-semibold">Últimas Despesas</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {rawData.expenses.length} despesa{rawData.expenses.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                }
                variant="light"
                elevation="medium"
                className="h-[550px] flex flex-col"
              >
                {/* Área com scroll interno - altura LIMITADA */}
                <div className="p-4">
                  {rawData.expenses.length === 0 ? (
                    <div className="text-center py-12 flex flex-col justify-center">
                      <TrendingDown className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground text-lg">Nenhuma despesa registrada</p>
                      <p className="text-sm text-muted-foreground mt-2">Clique em &quot;Nova Despesa&quot; para começar</p>
                    </div>
                  ) : (
                    <div className="h-[420px] overflow-y-scroll operations-scroll operations-scroll-expenses border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="space-y-2 p-3 min-h-[450px]">
                        {rawData.expenses
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((expense, index) => (
                        <motion.div 
                          key={expense.id}
                          className="flex justify-between items-center p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 border border-red-200 dark:border-red-700"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: Math.min(index * 0.03, 0.3) }}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {expense.description || 'Sem descrição'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatSafeDate(expense.date)}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-red-500 font-bold text-base">
                              -{formatCurrency(Number(expense.value) || 0)}
                            </div>
                            <Badge variant="outline" className="text-xs text-red-700 border-red-300 mt-0.5">
                              {EXPENSE_CATEGORIES[expense.categoryId as keyof typeof EXPENSE_CATEGORIES] || expense.categoryId || 'Sem categoria'}
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>
          </TabsContent>
          
          <TabsContent value="expenses" className="space-y-8 mt-8">
            {/* Expenses Analytics */}
            <div className="grid gap-8 grid-cols-1 lg:grid-cols-2 mb-8">
              <GlassCard
                title={
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <span>Evolução das Despesas</span>
                  </div>
                }
                variant="light"
                elevation="medium"
                className="h-[450px] flex flex-col"
              >
                <div className="p-4 flex-1">
                  <SimpleLineChart
                    data={expenseTrendData}
                    height={CHART_CONFIG.HEIGHT}
                    color={CHART_CONFIG.COLORS.ERROR}
                    tooltipLabel="Despesas"
                  />
                </div>
              </GlassCard>

              <GlassCard
                title={
                  <div className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-purple-600" />
                    <span>Despesas por Categoria</span>
                  </div>
                }
                variant="light"
                elevation="medium"
                className="h-[450px] flex flex-col"
              >
                <div className="p-4 flex-1">
                  <SimpleBarChart
                    data={expenseCategoryData}
                    height={CHART_CONFIG.HEIGHT}
                    color={CHART_CONFIG.COLORS.PRIMARY}
                    tooltipLabel="Gasto"
                  />
                </div>
              </GlassCard>
            </div>

            <GlassCard
              title="Todas as Despesas"
              variant="light"
              elevation="medium"
              className="bg-white dark:bg-gray-900"
            >
              <div className="p-4">
                <EnhancedTable
                  columns={expensesColumns}
                  data={isLoading ? [] : allOperations.filter(op => op.type === 'expense')}
                  searchColumn="description"
                  searchPlaceholder={TABLE_CONFIG.SEARCH_PLACEHOLDER.EXPENSES}
                  defaultPageSize={TABLE_CONFIG.DEFAULT_PAGE_SIZE}
                  pageSizeOptions={TABLE_CONFIG.PAGE_SIZE_OPTIONS}
                  title="Lista de Despesas"
                  description="Todas as despesas registradas no sistema"
                  showFilterText={false}
                  showFiltersControl={false}
                />
              </div>
            </GlassCard>
          </TabsContent>
          
          <TabsContent value="entries" className="space-y-8 mt-8">
            {/* Entries Analytics */}
            <div className="grid gap-8 grid-cols-1 lg:grid-cols-2 mb-8">
              <GlassCard
                title={
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span>Evolução das Entradas</span>
                  </div>
                }
                variant="light"
                elevation="medium"
                className="h-[450px] flex flex-col"
              >
                <div className="p-4 flex-1">
                  <SimpleLineChart
                    data={entryTrendData}
                    height={CHART_CONFIG.HEIGHT}
                    color={CHART_CONFIG.COLORS.SUCCESS}
                    tooltipLabel="Entradas"
                  />
                </div>
              </GlassCard>

              <GlassCard
                title={
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <span>Entradas por Fonte</span>
                  </div>
                }
                variant="light"
                elevation="medium"
                className="h-[450px] flex flex-col"
              >
                <div className="p-4 flex-1">
                  <SimpleBarChart
                    data={entryCategoryData}
                    height={CHART_CONFIG.HEIGHT}
                    color={CHART_CONFIG.COLORS.SUCCESS}
                    tooltipLabel="Receita"
                  />
                </div>
              </GlassCard>
            </div>

            <GlassCard
              title="Todas as Entradas"
              variant="light"
              elevation="medium"
              className="bg-white dark:bg-gray-900"
            >
              <div className="p-4">
                <EnhancedTable
                  columns={entriesColumns}
                  data={isLoading ? [] : allOperations.filter(op => op.type === 'entry')}
                  searchColumn="description"
                  searchPlaceholder={TABLE_CONFIG.SEARCH_PLACEHOLDER.ENTRIES}
                  defaultPageSize={TABLE_CONFIG.DEFAULT_PAGE_SIZE}
                  pageSizeOptions={TABLE_CONFIG.PAGE_SIZE_OPTIONS}
                  title="Lista de Entradas"
                  description="Todas as entradas registradas no sistema"
                  showFilterText={false}
                  showFiltersControl={false}
                />
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="all" className="space-y-8 mt-8">
            {/* Complete Analytics Dashboard */}
            <div className="grid gap-8 grid-cols-1 lg:grid-cols-3 mb-8">
              <GlassCard
                title={
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <span>Fluxo de Caixa</span>
                  </div>
                }
                variant="light"
                elevation="medium"
                className="h-[380px] flex flex-col"
              >
                <div className="p-4 flex-1">
                  <SimpleLineChart
                    data={dailyFlowData}
                    height={CHART_CONFIG.DAILY_CHART_HEIGHT}
                    color={CHART_CONFIG.COLORS.PRIMARY}
                    tooltipLabel="Saldo"
                  />
                </div>
              </GlassCard>

              <GlassCard
                title={
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-5 w-5 text-purple-600" />
                    <span>Entradas vs Despesas</span>
                  </div>
                }
                variant="light"
                elevation="medium"
                className="h-[380px] flex flex-col"
              >
                <div className="p-4 flex-1">
                  <SimpleBarChart
                    data={[
                      { name: 'Entradas', value: summary.totalEntries },
                      { name: 'Despesas', value: summary.totalExpenses },
                      { name: 'Resultado', value: Math.abs(summary.netResult) }
                    ]}
                    height={CHART_CONFIG.DAILY_CHART_HEIGHT}
                    color={CHART_CONFIG.COLORS.PURPLE}
                    tooltipLabel="Valor"
                  />
                </div>
              </GlassCard>

              <GlassCard
                title={
                  <div className="flex items-center gap-2">
                    <LineChart className="h-5 w-5 text-orange-600" />
                    <span>Distribuição</span>
                  </div>
                }
                variant="light"
                elevation="medium"
                className="h-[380px] flex flex-col"
              >
                <div className="p-4 flex-1">
                  <SimpleBarChart
                    data={expenseCategoryData.length > 0 ? expenseCategoryData : entryCategoryData}
                    height={CHART_CONFIG.DAILY_CHART_HEIGHT}
                    color={CHART_CONFIG.COLORS.WARNING}
                    tooltipLabel="Volume"
                  />
                </div>
              </GlassCard>
            </div>

            <GlassCard
              title="Todas as Operações"
              variant="light"
              elevation="medium"
              className="bg-white dark:bg-gray-900"
            >
              <div className="p-4">
                <EnhancedTable
                  columns={allColumns}
                  data={isLoading ? [] : allOperations}
                  searchColumn="description"
                  searchPlaceholder={TABLE_CONFIG.SEARCH_PLACEHOLDER.ALL}
                  defaultPageSize={TABLE_CONFIG.ALL_OPERATIONS_PAGE_SIZE}
                  pageSizeOptions={TABLE_CONFIG.PAGE_SIZE_OPTIONS}
                  title="Lista Completa de Operações"
                  description="Todas as operações financeiras (despesas e entradas) registradas no sistema"
                  showFilterText={false}
                  showFiltersControl={false}
                />
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </motion.div>
      </div>
    </>
  );
} 
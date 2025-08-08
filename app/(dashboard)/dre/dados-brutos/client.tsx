"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, Calculator, FileDown } from "lucide-react";
import Link from "next/link";
import { useHeaderContent } from "@/hooks/use-header-content";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";
import { DateRangePicker } from "@/components/date-range-picker";
import { CSVUpload } from "../_components/csv-upload";
import { useUploadCSV } from "@/features/finance/api/use-upload-csv";
import { useGetRawFinancialData } from "@/features/finance/api/use-get-raw-financial-data";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { AdvancedDataTable, TableColumn } from "@/components/ui/advanced-data-table";
import { DataInsights } from "../_components/data-insights";

export default function RawDataClient() {
  const [selectedTab, setSelectedTab] = useState("dados");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const { toast } = useToast();
  const { mutate: uploadCSV, isPending: isUploading } = useUploadCSV();

  // Configurar header dinâmico
  useHeaderContent({
    title: "Dados Financeiros Brutos",
    subtitle: "Análise detalhada dos dados importados via CSV",
    pageType: 'dre',
    showDefaultActions: true
  });

  // Buscar dados com filtros
  const { data: rawData, isLoading, error, refetch } = useGetRawFinancialData({
    page,
    pageSize,
    searchTerm: filters.global || "",
    startDate: dateRange.from,
    endDate: dateRange.to,
  });

  // Configuração das colunas para a tabela avançada
  const columns: TableColumn[] = [
    { key: "__rowId", title: "ID", type: "text", sortable: false, filterable: false, width: "160px", render: (_, row) => row.id || row.IdOperacao },
    { key: "IdOperacao", title: "ID Operação", type: "text", sortable: true },
    { key: "Data", title: "Data", type: "date", sortable: true },
    { key: "CPFCNPJCedente", title: "CPF/CNPJ Cedente", type: "text", sortable: true },
    { key: "Fator", title: "Fator", type: "decimal", sortable: true },
    { key: "AdValorem", title: "AdValorem", type: "decimal", sortable: true },
    { key: "ValorFator", title: "Valor Fator", type: "currency", sortable: true, align: "right" },
    { key: "ValorAdValorem", title: "Valor AdValorem", type: "currency", sortable: true, align: "right" },
    { key: "ValorIOF", title: "Valor IOF", type: "currency", sortable: true, align: "right" },
    { key: "RetencaoPIS", title: "Retenção PIS", type: "currency", sortable: true, align: "right" },
    { key: "RetencaoIR", title: "Retenção IR", type: "currency", sortable: true, align: "right" },
    { key: "RetencaoCSLL", title: "Retenção CSLL", type: "currency", sortable: true, align: "right" },
    { key: "RetencaoCOFINS", title: "Retenção COFINS", type: "currency", sortable: true, align: "right" },
    { key: "PIS", title: "PIS", type: "currency", sortable: true, align: "right" },
    { key: "CSLL", title: "CSLL", type: "currency", sortable: true, align: "right" },
    { key: "COFINS", title: "COFINS", type: "currency", sortable: true, align: "right" },
    { key: "ISSQN", title: "ISSQN", type: "currency", sortable: true, align: "right" },
    { key: "ValorTarifas", title: "Valor Tarifas", type: "currency", sortable: true, align: "right" },
    { key: "ValorLiquido", title: "Valor Líquido", type: "currency", sortable: true, align: "right" },
    { key: "ValorIOFAdicional", title: "Valor IOF Adicional", type: "currency", sortable: true, align: "right" },
    { key: "RetencaoISS", title: "Retenção ISS", type: "currency", sortable: true, align: "right" },
    { key: "IRPJ", title: "IRPJ", type: "currency", sortable: true, align: "right" },
    { key: "DataFinalizacao", title: "Data Finalização", type: "date", sortable: true },
    { key: "Pais", title: "País", type: "text", sortable: true },
    { key: "Regiao", title: "Região", type: "text", sortable: true },
    { key: "Etapa", title: "Etapa", type: "text", sortable: true },
    { key: "DataPagamento", title: "Data Pagamento", type: "date", sortable: true },
  ];

  const handleUploadCSV = useCallback(async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      await new Promise((resolve, reject) => {
        uploadCSV(formData, {
          onSuccess: () => {
            toast({
              title: "Upload realizado com sucesso!",
              description: `Arquivo "${file.name}" foi processado.`,
            });
            setIsUploadDialogOpen(false);
            refetch();
            resolve(true);
          },
          onError: (error: any) => {
            toast({
              title: "Erro no upload",
              description: error?.message || "Ocorreu um erro ao processar o arquivo.",
              variant: "destructive",
            });
            reject(error);
          },
        });
      });
    } catch (error) {
      throw error;
    }
  }, [uploadCSV, toast, refetch]);

  const handleExport = useCallback(() => {
    toast({
      title: "Exportando dados...",
      description: "O arquivo será baixado em instantes.",
    });
  }, [toast]);

  const handleDeleteSelected = useCallback(async (ids: string[]) => {
    if (!ids.length) return;
    try {
      const res = await fetch('/api/finance/raw-data', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      if (!res.ok) throw new Error('Falha ao excluir registros');
      toast({ title: 'Registros excluídos', description: `${ids.length} registro(s) removido(s).` });
      await refetch();
    } catch (e: any) {
      toast({ title: 'Erro ao excluir', description: e?.message || 'Tente novamente.', variant: 'destructive' });
    }
  }, [refetch, toast]);

  const handleDeleteAll = useCallback(async () => {
    try {
      const confirmed = window.confirm('Tem certeza que deseja excluir TODOS os registros? Esta ação não pode ser desfeita.');
      if (!confirmed) return;
      const res = await fetch('/api/finance/raw-data', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true })
      });
      if (!res.ok) throw new Error('Falha ao excluir todos os registros');
      toast({ title: 'Todos os registros excluídos', description: 'A tabela foi limpa.' });
      await refetch();
    } catch (e: any) {
      toast({ title: 'Erro ao excluir', description: e?.message || 'Tente novamente.', variant: 'destructive' });
    }
  }, [refetch, toast]);

  const handleDateRangeChange = useCallback((range: any) => {
    setDateRange({
      from: range?.from,
      to: range?.to,
    });
  }, []);

  // Calcular estatísticas dos dados
  const calculateStats = () => {
    if (!rawData?.data?.length) {
      return {
        totalRecords: 0,
        totalValue: 0,
        avgValue: 0,
        maxValue: 0,
        minValue: 0,
      };
    }

    const values = rawData.data.map(item => parseFloat(item.ValorLiquido || "0"));
    const totalValue = values.reduce((sum, value) => sum + value, 0);
    
    return {
      totalRecords: rawData.totalRecords || rawData.data.length,
      totalValue,
      avgValue: totalValue / values.length,
      maxValue: Math.max(...values),
      minValue: Math.min(...values.filter(v => v > 0)),
    };
  };

  const stats = calculateStats();

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-4 md:p-6 max-w-full">
        {/* Header Section - Simplificado */}
    <motion.div 
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild className="shadow-sm">
          <Link href="/dre">
            <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para DRE
          </Link>
        </Button>
          </div>

          <div className="flex items-center gap-3">
            <DateRangePicker
              value={dateRange}
              onValueChange={handleDateRangeChange}
              placeholder="Filtrar por período"
            />


            <Button 
              variant="neonGhost" 
              size="sm" 
              onClick={handleExport}
              className="shadow-sm"
            >
              <Calculator className="mr-2 h-4 w-4" />
              Calculadora
            </Button>
            
            <Button 
              variant="neon" 
              size="sm" 
              onClick={() => setIsUploadDialogOpen(true)}
              className="shadow-sm"
            >
              <Upload className="mr-2 h-4 w-4" />
              Novo Upload
            </Button>
            <Button 
              variant="neonGhost" 
              size="sm" 
              onClick={handleExport}
              className="shadow-sm"
            >
              <FileDown className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </motion.div>

        {/* Tabs Navigation - Melhorado */}
            <motion.div
          initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <GlassCard className="p-1 mb-6">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-transparent gap-1">
                <TabsTrigger 
                  value="dados" 
                  className="flex items-center gap-2 data-[state=active]:bg-white/90 dark:data-[state=active]:bg-slate-800/90 data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 dark:data-[state=active]:shadow-blue-400/30 transition-all duration-300"
                >
                  <span className="hidden sm:inline">Dados Brutos</span>
                  <span className="sm:hidden">Dados</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="historico"
                  className="flex items-center gap-2 data-[state=active]:bg-white/90 dark:data-[state=active]:bg-slate-800/90 data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/20 dark:data-[state=active]:shadow-green-400/30 transition-all duration-300"
                >
                  <span className="hidden sm:inline">Histórico Uploads</span>
                  <span className="sm:hidden">Histórico</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="analise"
                  className="flex items-center gap-2 data-[state=active]:bg-white/90 dark:data-[state=active]:bg-slate-800/90 data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/20 dark:data-[state=active]:shadow-purple-400/30 transition-all duration-300"
                >
                  <span className="hidden sm:inline">Análise Dados</span>
                  <span className="sm:hidden">Análise</span>
                </TabsTrigger>
              </TabsList>

              {/* Tab Content */}
              <div className="mt-6">
                <TabsContent value="dados" className="space-y-6">
                  <motion.div
                    variants={tabVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.5 }}
                  >
                    <AdvancedDataTable
                      data={rawData?.data || []}
                      columns={columns}
                      title="Tabela de Dados Financeiros"
                      isLoading={isLoading}
                      error={error}
                      totalRecords={rawData?.totalRecords || 0}
                      currentPage={page}
                      pageSize={pageSize}
                      onPageChange={setPage}
                      onPageSizeChange={setPageSize}
                      onFilter={setFilters}
                      onExport={handleExport}
                      defaultVisibleColumns={["IdOperacao", "Data", "CPFCNPJCedente", "ValorLiquido", "Etapa"]}
                      className="border-0 shadow-lg"
                      enableRowSelection
                      onDeleteSelected={handleDeleteSelected}
                      onDeleteAll={handleDeleteAll}
                      getRowId={(row) => row.id || row.IdOperacao}
                    />
            </motion.div>
          </TabsContent>

                <TabsContent value="historico" className="space-y-6">
            <motion.div
                    variants={tabVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.5 }}
                  >
                    <GlassCard className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Histórico de Uploads</h3>
                      <p className="text-muted-foreground">
                        Funcionalidade em desenvolvimento...
                      </p>
                    </GlassCard>
            </motion.div>
          </TabsContent>

                <TabsContent value="analise" className="space-y-6">
            <motion.div
                    variants={tabVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.5 }}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Card de Estatísticas Gerais */}
                      <GlassCard className="p-6 lg:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
                            <Calculator className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              Resumo dos Dados
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Estatísticas gerais dos dados importados
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="p-4 rounded-lg bg-white/50 dark:bg-slate-800/50">
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                              {stats.totalRecords.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Total Registros
                            </div>
                          </div>
                          <div className="p-4 rounded-lg bg-white/50 dark:bg-slate-800/50">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {formatCurrency(stats.totalValue)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Valor Total
                            </div>
                          </div>
                          <div className="p-4 rounded-lg bg-white/50 dark:bg-slate-800/50">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {formatCurrency(stats.avgValue)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Valor Médio
                            </div>
                          </div>
                          <div className="p-4 rounded-lg bg-white/50 dark:bg-slate-800/50">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              {formatCurrency(stats.maxValue)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Maior Valor
                            </div>
                          </div>
                        </div>
                      </GlassCard>
                    </div>
            </motion.div>
          </TabsContent>
              </div>
        </Tabs>
          </GlassCard>
      </motion.div>

        {/* Upload Dialog */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload de Arquivo CSV</DialogTitle>
            </DialogHeader>
            <CSVUpload
              onUpload={handleUploadCSV}
              isUploading={isUploading}
              error={null}
              open={isUploadDialogOpen}
              onOpenChange={setIsUploadDialogOpen}
            />
          </DialogContent>
        </Dialog>

        {/* Raw data is already analyzed in the "analise" tab above */}
      </div>
    </div>
  );
} 
"use client";

import { useUploadHistory } from "@/hooks/use-upload-history";
import { AdvancedDataTable, TableColumn } from "@/components/ui/advanced-data-table";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatBytes } from "@/lib/format-utils";

export const UploadHistoryClient = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [filter, setFilter] = useState<{ success?: boolean }>({});

  // Configurar colunas para a tabela
  const columns: TableColumn[] = [
    {
      key: "id",
      title: "ID",
      type: "number",
      sortable: true,
      width: "60px",
    },
    {
      key: "originalFilename",
      title: "Nome do Arquivo",
      type: "text",
      sortable: true,
      filterable: true,
    },
    {
      key: "fileSize",
      title: "Tamanho",
      type: "text",
      sortable: true,
      align: "right",
    },
    {
      key: "importedAt",
      title: "Data de Importação",
      type: "date",
      sortable: true,
    },
    {
      key: "importedBy",
      title: "Importado Por",
      type: "text",
      sortable: true,
      filterable: true,
    },
    {
      key: "success",
      title: "Status",
      type: "text",
      sortable: true,
      filterable: true,
    },
    {
      key: "recordsProcessed",
      title: "Registros Processados",
      type: "number",
      sortable: true,
      align: "right",
    },
    {
      key: "recordsFailed",
      title: "Registros com Falha",
      type: "number",
      sortable: true,
      align: "right",
    },
    {
      key: "processingTime",
      title: "Tempo de Processamento",
      type: "text",
      sortable: true,
      align: "right",
    },
  ];

  // Usar o hook para cada tab
  const allUploads = useUploadHistory({ 
    initialPage: 1, 
    pageSize: 10
  });

  const successUploads = useUploadHistory({ 
    initialPage: 1, 
    pageSize: 10, 
    initialFilter: { success: true } 
  });

  const failedUploads = useUploadHistory({ 
    initialPage: 1, 
    pageSize: 10, 
    initialFilter: { success: false } 
  });

  // Formatar valores específicos para exibição
  const formatValue = (value: any, type: string, columnKey?: string) => {
    if (value === null || value === undefined) return "-";
    
    // Formatação especial por coluna
    if (columnKey === "fileSize") {
      return formatBytes(value);
    }
    
    if (columnKey === "success") {
      return value 
        ? <Badge className="bg-green-500">Sucesso</Badge> 
        : <Badge className="bg-red-500">Falha</Badge>;
    }

    if (columnKey === "importedAt") {
      try {
        return format(new Date(value), "PPp", { locale: ptBR });
      } catch {
        return "-";
      }
    }

    if (columnKey === "processingTime") {
      // Converter milissegundos para formato legível
      if (typeof value === 'number') {
        if (value < 1000) return `${value}ms`;
        return `${(value / 1000).toFixed(2)}s`;
      }
      return "-";
    }
    
    // Formatação padrão para outros tipos
    switch (type) {
      case "number":
        return value.toLocaleString("pt-BR");
      default:
        return value;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Histórico de Uploads</h2>
      <p className="text-muted-foreground">
        Acompanhe todos os arquivos importados para a plataforma.
      </p>

      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
        if (value === "all") setFilter({});
        else if (value === "success") setFilter({ success: true });
        else if (value === "failed") setFilter({ success: false });
      }}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="success">Bem-sucedidos</TabsTrigger>
          <TabsTrigger value="failed">Falhas</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          <AdvancedDataTable
            data={allUploads.data}
            columns={columns}
            title="Todos os Uploads"
            isLoading={allUploads.isLoading}
            error={allUploads.error}
            totalRecords={allUploads.pagination.total}
            currentPage={allUploads.pagination.page}
            pageSize={allUploads.pagination.pageSize}
            onPageChange={allUploads.setPage}
            onPageSizeChange={allUploads.setPageSize}
            formatValue={(value, type) => formatValue(value, type, columns.find(c => value === c[value as keyof typeof c])?.key)}
          />
        </TabsContent>

        <TabsContent value="success" className="space-y-4 mt-4">
          <AdvancedDataTable
            data={successUploads.data}
            columns={columns}
            title="Uploads Bem-sucedidos"
            isLoading={successUploads.isLoading}
            error={successUploads.error}
            totalRecords={successUploads.pagination.total}
            currentPage={successUploads.pagination.page}
            pageSize={successUploads.pagination.pageSize}
            onPageChange={successUploads.setPage}
            onPageSizeChange={successUploads.setPageSize}
            formatValue={(value, type) => formatValue(value, type, columns.find(c => value === c[value as keyof typeof c])?.key)}
          />
        </TabsContent>

        <TabsContent value="failed" className="space-y-4 mt-4">
          <AdvancedDataTable
            data={failedUploads.data}
            columns={columns}
            title="Uploads com Falha"
            isLoading={failedUploads.isLoading}
            error={failedUploads.error}
            totalRecords={failedUploads.pagination.total}
            currentPage={failedUploads.pagination.page}
            pageSize={failedUploads.pagination.pageSize}
            onPageChange={failedUploads.setPage}
            onPageSizeChange={failedUploads.setPageSize}
            formatValue={(value, type) => formatValue(value, type, columns.find(c => value === c[value as keyof typeof c])?.key)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}; 
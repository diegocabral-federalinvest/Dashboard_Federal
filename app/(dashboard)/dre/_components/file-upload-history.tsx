"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, UploadCloud, FileText, AlertCircle, Check, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetFileUploads } from "@/features/finance/api/use-get-file-uploads";
import { CSVUpload } from "./csv-upload";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function FileUploadHistory() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  const { data: fileUploads, isLoading, error } = useGetFileUploads();
  
  const handleUploadComplete = () => {
    setIsUploadOpen(false);
  };
  
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle>Histórico de Uploads</CardTitle>
            <CardDescription>Arquivos CSV processados para relatório</CardDescription>
          </div>
          <Button onClick={() => setIsUploadOpen(true)}>
            <UploadCloud className="h-4 w-4 mr-2" />
            Novo Upload
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {isUploadOpen ? (
          <div className="p-4 border rounded-md mb-4">
            <h3 className="text-sm font-medium mb-2">Upload de arquivo CSV</h3>
            <CSVUpload
              onUpload={(file) => Promise.resolve()}
              isUploading={false}
              error={null}
              open={isUploadOpen}
              onOpenChange={setIsUploadOpen}
            />
          </div>
        ) : null}
        
        <Tabs defaultValue="recent">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recent">Recentes</TabsTrigger>
            <TabsTrigger value="all">Todos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recent" className="mt-4">
            <FileList 
              files={fileUploads?.slice(0, 5)} 
              isLoading={isLoading} 
              error={error}
            />
          </TabsContent>
          
          <TabsContent value="all" className="mt-4">
            <FileList 
              files={fileUploads} 
              isLoading={isLoading} 
              error={error}
              showScrollArea
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface FileListProps {
  files?: {
    id: string;
    filename: string;
    size: number;
    rows: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    error?: string;
  }[];
  isLoading: boolean;
  error: Error | null;
  showScrollArea?: boolean;
}

function FileList({ files, isLoading, error, showScrollArea = false }: FileListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
        <AlertCircle className="h-6 w-6 text-red-500" />
        <p className="text-sm text-muted-foreground">
          Erro ao carregar histórico: {error.message}
        </p>
      </div>
    );
  }
  
  if (!files?.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
        <FileText className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Nenhum arquivo foi carregado ainda.
        </p>
      </div>
    );
  }
  
  const fileList = (
    <div className="space-y-3">
      {files.map((file) => (
        <div 
          key={file.id} 
          className="flex items-start p-3 border rounded-md hover:bg-muted/50 transition-colors"
        >
          <div className="mr-3 mt-1">
            {file.status === "success" ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : file.status === "processing" ? (
              <Clock className="h-5 w-5 text-amber-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
          
          <div className="flex-1 space-y-1">
            <div className="flex justify-between items-start">
              <div className="font-medium text-sm truncate max-w-[200px]" title={file.filename}>
                {file.filename}
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(file.createdAt), { 
                  addSuffix: true,
                  locale: ptBR
                })}
              </span>
            </div>
            
            <div className="text-xs text-muted-foreground">
              {formatFileSize(file.size)} • {file.rows} registros
            </div>
            
            {file.status === "error" && file.error && (
              <div className="text-xs text-red-500">
                Erro: {file.error}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
  
  if (showScrollArea) {
    return (
      <ScrollArea className="h-[300px]">
        {fileList}
      </ScrollArea>
    );
  }
  
  return fileList;
}

// Função para formatar o tamanho do arquivo
function formatFileSize(sizeInBytes: number): string {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`;
  } else if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(1)} KB`;
  } else if (sizeInBytes < 1024 * 1024 * 1024) {
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  } else {
    return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }
} 
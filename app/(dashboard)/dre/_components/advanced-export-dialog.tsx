"use client";

import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  FileText, 
  Image, 
  FileSpreadsheet, 
  File,
  Loader2 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface AdvancedExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExportAdvancedPDF: () => Promise<void>;
  onExportAdvancedPNG: () => Promise<void>;
  onExportSimplePDF: () => void;
  onExportExcel: () => void;
  onExportCSV: () => void;
  isExporting?: boolean;
}

export function AdvancedExportDialog({
  isOpen,
  onClose,
  onExportAdvancedPDF,
  onExportAdvancedPNG,
  onExportSimplePDF,
  onExportExcel,
  onExportCSV,
  isExporting = false
}: AdvancedExportDialogProps) {
  const [exportingType, setExportingType] = useState<string | null>(null);

  const handleExport = async (type: string, exportFn: () => void | Promise<void>) => {
    setExportingType(type);
    try {
      await exportFn();
    } finally {
      setExportingType(null);
    }
  };

  const exportOptions = [
    {
      id: 'advanced-pdf',
      title: 'PDF Avançado',
      description: 'Relatório profissional com logo, cards e gráficos',
      icon: FileText,
      badge: 'Novo',
      badgeVariant: 'default' as const,
      action: onExportAdvancedPDF,
      color: 'bg-red-50 hover:bg-red-100 border-red-200 text-red-900',
      iconColor: 'text-red-600'
    },
    {
      id: 'advanced-png',
      title: 'PNG de Alta Qualidade',
      description: 'Imagem profissional para apresentações',
      icon: Image,
      badge: 'Novo',
      badgeVariant: 'default' as const,
      action: onExportAdvancedPNG,
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-900',
      iconColor: 'text-purple-600'
    },
    {
      id: 'simple-pdf',
      title: 'PDF Simples',
      description: 'Tabela básica em formato PDF',
      icon: FileText,
      badge: 'Clássico',
      badgeVariant: 'secondary' as const,
      action: onExportSimplePDF,
      color: 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-900',
      iconColor: 'text-gray-600'
    },
    {
      id: 'excel',
      title: 'Excel',
      description: 'Planilha para análise detalhada',
      icon: FileSpreadsheet,
      badge: null,
      action: onExportExcel,
      color: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-900',
      iconColor: 'text-green-600'
    },
    {
      id: 'csv',
      title: 'CSV',
      description: 'Dados em formato texto separado por vírgulas',
      icon: File,
      badge: null,
      action: onExportCSV,
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-900',
      iconColor: 'text-blue-600'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Relatório DRE
          </DialogTitle>
          <DialogDescription>
            Escolha o formato de exportação que melhor atende às suas necessidades.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {/* Seção de exportações avançadas */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              ✨ Relatórios Profissionais
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {exportOptions.slice(0, 2).map((option) => {
                const Icon = option.icon;
                const isCurrentlyExporting = exportingType === option.id;
                
                return (
                  <Button
                    key={option.id}
                    variant="outline"
                    className={`h-auto p-4 ${option.color} border-2 transition-all duration-200 hover:shadow-md`}
                    disabled={isExporting}
                    onClick={() => handleExport(option.id, option.action)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div className={`p-2 rounded-lg bg-white shadow-sm ${option.iconColor}`}>
                        {isCurrentlyExporting ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{option.title}</span>
                          {option.badge && (
                            <Badge 
                              variant={option.badgeVariant}
                              className="text-xs px-2 py-0.5"
                            >
                              {option.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm opacity-80">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Seção de exportações tradicionais */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              📊 Formatos Tradicionais
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {exportOptions.slice(2).map((option) => {
                const Icon = option.icon;
                const isCurrentlyExporting = exportingType === option.id;
                
                return (
                  <Button
                    key={option.id}
                    variant="outline"
                    className={`h-auto p-3 ${option.color} justify-start transition-all duration-200`}
                    disabled={isExporting}
                    onClick={() => handleExport(option.id, option.action)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className={`p-1.5 rounded-md ${option.iconColor}`}>
                        {isCurrentlyExporting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{option.title}</span>
                          {option.badge && (
                            <Badge 
                              variant={option.badgeVariant}
                              className="text-xs px-2 py-0.5"
                            >
                              {option.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs opacity-70 mt-0.5">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
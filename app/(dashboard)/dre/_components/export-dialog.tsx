"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet, Files } from "lucide-react";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: "pdf" | "excel" | "csv") => void;
  isDetailed?: boolean;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  onExport,
  isDetailed = false,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar Relatório DRE</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4 py-4">
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center p-6 h-auto space-y-2"
            onClick={() => onExport("pdf")}
          >
            <FileText className="h-8 w-8 text-blue-500" />
            <span>PDF</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center p-6 h-auto space-y-2"
            onClick={() => onExport("excel")}
          >
            <FileSpreadsheet className="h-8 w-8 text-green-500" />
            <span>Excel</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center p-6 h-auto space-y-2"
            onClick={() => onExport("csv")}
          >
            <Files className="h-8 w-8 text-orange-500" />
            <span>CSV</span>
          </Button>
        </div>
        <div className="text-sm text-gray-500">
          {isDetailed
            ? "O relatório exportado conterá todas as linhas detalhadas."
            : "O relatório exportado conterá as linhas atualmente visíveis."}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 
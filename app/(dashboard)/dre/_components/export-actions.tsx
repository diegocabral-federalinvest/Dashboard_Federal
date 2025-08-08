"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Download,
  FileSpreadsheet, 
  FileType, 
  File, 
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface ExportActionsProps {
  isExporting: boolean;
  onExportCSV: () => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
}

export const ExportActions: React.FC<ExportActionsProps> = ({
  isExporting,
  onExportCSV,
  onExportExcel,
  onExportPDF
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          size="sm"
          variant="outline"
          className="ml-auto"
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onExportCSV} disabled={isExporting}>
          <File className="h-4 w-4 mr-2" />
          Exportar CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportExcel} disabled={isExporting}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exportar Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportPDF} disabled={isExporting}>
          <FileType className="h-4 w-4 mr-2" />
          Exportar PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
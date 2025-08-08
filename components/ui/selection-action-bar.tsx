"use client";

import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  FileSpreadsheet, 
  FileJson, 
  Trash, 
  X, 
  ChevronUp, 
  ChevronDown 
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface SelectionActionBarProps<TData> {
  selectedRows: Row<TData>[];
  onDelete?: (rows: Row<TData>[]) => void;
  onExport?: (rows: Row<TData>[], format: "pdf" | "csv" | "excel") => void;
  onClearSelection: () => void;
}

export function SelectionActionBar<TData>({
  selectedRows,
  onDelete,
  onExport,
  onClearSelection
}: SelectionActionBarProps<TData>) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  if (selectedRows.length === 0) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50"
      >
        <div className="bg-background border-t border-border shadow-lg mx-auto max-w-7xl">
          <div className="flex items-center justify-between px-4 py-1.5 border-b">
            <div className="font-medium flex items-center gap-2">
              <span className="bg-primary text-primary-foreground rounded-full h-6 w-6 inline-flex items-center justify-center text-xs">
                {selectedRows.length}
              </span>
              <span>item(s) selecionado(s)</span>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                onClick={onClearSelection}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {isExpanded && (
            <div className="p-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                O que você deseja fazer com os itens selecionados?
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center space-x-1 border-r pr-3 mr-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 group hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-200"
                    onClick={() => onExport?.(selectedRows, "pdf")}
                    disabled={!onExport}
                  >
                    <FileText className="h-4 w-4 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    <span>PDF</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 group hover:bg-green-50 dark:hover:bg-green-950 hover:text-green-600 dark:hover:text-green-400 hover:border-green-200 dark:hover:border-green-900 transition-all duration-200"
                    onClick={() => onExport?.(selectedRows, "excel")}
                    disabled={!onExport}
                  >
                    <FileSpreadsheet className="h-4 w-4 group-hover:text-green-600 dark:group-hover:text-green-400" />
                    <span>Excel</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 group hover:bg-amber-50 dark:hover:bg-amber-950 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-200 dark:hover:border-amber-900 transition-all duration-200"
                    onClick={() => onExport?.(selectedRows, "csv")}
                    disabled={!onExport}
                  >
                    <FileJson className="h-4 w-4 group-hover:text-amber-600 dark:group-hover:text-amber-400" />
                    <span>CSV</span>
                  </Button>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => onDelete?.(selectedRows)}
                  disabled={!onDelete}
                >
                  <Trash className="h-4 w-4" />
                  <span>Excluir</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
} 
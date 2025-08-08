"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  columnTitle: string;
  currentValue: string;
  onFilter: (value: string) => void;
  onClear: () => void;
}

export function FilterModal({
  isOpen,
  onClose,
  columnTitle,
  currentValue,
  onFilter,
  onClear,
}: FilterModalProps) {
  const [filterValue, setFilterValue] = useState(currentValue);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincronizar com valor atual quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      setFilterValue(currentValue);
      // Focar no input quando abrir
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isOpen, currentValue]);

  // Filtro em tempo real
  useEffect(() => {
    if (isOpen) {
      onFilter(filterValue);
    }
  }, [filterValue, onFilter, isOpen]);

  const handleClear = () => {
    setFilterValue("");
    onClear();
  };

  const handleClose = () => {
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose();
    }
    if (e.key === "Enter") {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Filtrar: {columnTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Input
              ref={inputRef}
              placeholder={`Buscar em ${columnTitle}...`}
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pr-8"
            />
            {filterValue && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={handleClear}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>
              {filterValue ? `Filtrando por: "${filterValue}"` : "Digite para filtrar"}
            </span>
            <span className="text-xs">
              ESC para fechar
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={!filterValue}
              className="flex-1"
            >
              Limpar
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleClose}
              className="flex-1"
            >
              Concluído
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
"use client";

import * as React from "react";
import { format, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronRight } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

interface DateRangePickerProps {
  value: DateRange;
  onValueChange: (value: DateRange) => void;
  className?: string;
  align?: "start" | "center" | "end";
  placeholder?: string;
}

export function DateRangePicker({
  value,
  onValueChange,
  className,
  align = "start",
  placeholder = "Selecione um período"
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handlePresetClick = (preset: { from: Date; to: Date }) => {
    onValueChange(preset);
    setIsOpen(false);
  };

  const presets = [
    {
      label: "Este mês",
      value: () => {
        const now = new Date();
        return {
          from: startOfMonth(now),
          to: endOfMonth(now)
        };
      }
    },
    {
      label: "Mês passado",
      value: () => {
        const lastMonth = subMonths(new Date(), 1);
        return {
          from: startOfMonth(lastMonth),
          to: endOfMonth(lastMonth)
        };
      }
    },
    {
      label: "Este trimestre",
      value: () => {
        const now = new Date();
        return {
          from: startOfQuarter(now),
          to: endOfQuarter(now)
        };
      }
    },
    {
      label: "Este ano",
      value: () => {
        const now = new Date();
        return {
          from: startOfYear(now),
          to: endOfYear(now)
        };
      }
    }
  ];

  const displayValue = () => {
    if (!value?.from && !value?.to) {
      return placeholder;
    }
    
    if (value.from && !value.to) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">De:</span>
          <span>{format(value.from, "dd/MM/yyyy", { locale: ptBR })}</span>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground">...</span>
        </div>
      );
    }
    
    if (value.from && value.to) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">De:</span>
          <span>{format(value.from, "dd/MM/yyyy", { locale: ptBR })}</span>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Até:</span>
          <span>{format(value.to, "dd/MM/yyyy", { locale: ptBR })}</span>
        </div>
      );
    }
    
    return placeholder;
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full max-w-[400px] justify-start text-left font-normal",
              !value?.from && !value?.to && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayValue()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <div className="flex">
            {/* Presets */}
            <div className="border-r p-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Atalhos rápidos
              </p>
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start font-normal"
                  onClick={() => handlePresetClick(preset.value())}
                >
                  {preset.label}
                </Button>
              ))}
              <Separator className="my-2" />
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start font-normal"
                onClick={() => {
                  onValueChange({ from: undefined, to: undefined });
                  setIsOpen(false);
                }}
              >
                Limpar seleção
              </Button>
            </div>
            
            {/* Calendar */}
            <div className="p-3">
              <div className="space-y-2 mb-3">
                <h4 className="font-medium text-sm">Período personalizado</h4>
                <p className="text-xs text-muted-foreground">
                  Clique na data inicial e depois na data final
                </p>
              </div>
              
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={value?.from}
                selected={value}
                onSelect={(range) => {
                  onValueChange(range as DateRange);
                  // Auto close if both dates are selected
                  if (range?.from && range?.to) {
                    setTimeout(() => setIsOpen(false), 150);
                  }
                }}
                numberOfMonths={2}
                locale={ptBR}
                showOutsideDays={false}
              />
              
              {/* Selected dates display */}
              {(value?.from || value?.to) && (
                <div className="mt-3 pt-3 border-t space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Início:</span>
                    <span className="font-medium">
                      {value.from ? format(value.from, "dd/MM/yyyy", { locale: ptBR }) : "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Fim:</span>
                    <span className="font-medium">
                      {value.to ? format(value.to, "dd/MM/yyyy", { locale: ptBR }) : "-"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

export type PeriodFilter = "today" | "week" | "month" | "3months" | "6months" | "year" | "custom";

interface ChartFiltersProps {
  activePeriod: PeriodFilter;
  onPeriodChange: (period: PeriodFilter) => void;
  dateRange?: DateRange;
  onDateRangeChange: (range: DateRange | undefined) => void;
  isRealTime: boolean;
  onToggleRealTime: (enabled: boolean) => void;
}

const PERIOD_OPTIONS = [
  { value: "today" as PeriodFilter, label: "Hoje", icon: <Clock className="w-3 h-3" /> },
  { value: "week" as PeriodFilter, label: "7 dias", icon: <Calendar className="w-3 h-3" /> },
  { value: "month" as PeriodFilter, label: "30 dias", icon: <Calendar className="w-3 h-3" /> },
  { value: "3months" as PeriodFilter, label: "3 meses", icon: <Calendar className="w-3 h-3" /> },
  { value: "6months" as PeriodFilter, label: "6 meses", icon: <Calendar className="w-3 h-3" /> },
  { value: "year" as PeriodFilter, label: "1 ano", icon: <Calendar className="w-3 h-3" /> },
  { value: "custom" as PeriodFilter, label: "Personalizado", icon: <Calendar className="w-3 h-3" /> },
];

export default function ChartFilters({
  activePeriod,
  onPeriodChange,
  dateRange,
  onDateRangeChange,
  isRealTime,
  onToggleRealTime,
}: ChartFiltersProps) {
  
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const getDateRangeForPeriod = (period: PeriodFilter): DateRange | undefined => {
    const today = new Date();
    
    switch (period) {
      case "today":
        return { from: today, to: today };
      case "week":
        return { from: addDays(today, -7), to: today };
      case "month":
        return { from: addDays(today, -30), to: today };
      case "3months":
        return { from: addDays(today, -90), to: today };
      case "6months":
        return { from: addDays(today, -180), to: today };
      case "year":
        return { from: addDays(today, -365), to: today };
      default:
        return dateRange;
    }
  };

  const handlePeriodClick = (period: PeriodFilter) => {
    onPeriodChange(period);
    
    if (period !== "custom") {
      const range = getDateRangeForPeriod(period);
      onDateRangeChange(range);
      setDatePickerOpen(false);
    } else {
      setDatePickerOpen(true);
    }
  };

  const formatDateRange = () => {
    if (!dateRange?.from) return "";
    
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, "dd/MM", { locale: ptBR })} - ${format(dateRange.to, "dd/MM", { locale: ptBR })}`;
    } else {
      return format(dateRange.from, "dd/MM/yyyy", { locale: ptBR });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-wrap items-center gap-3 p-4 bg-gradient-to-r from-blue-900/20 to-blue-800/10 dark:from-blue-950/30 dark:to-blue-900/20 backdrop-blur-sm border border-blue-600/20 dark:border-blue-500/10 rounded-lg"
    >
      {/* Título */}
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-blue-400" />
        <span className="text-sm font-medium text-blue-100 dark:text-blue-200">
          Período:
        </span>
      </div>

      {/* Botões de período rápido */}
      <div className="flex flex-wrap gap-2">
        {PERIOD_OPTIONS.slice(0, 6).map((option) => (
          <Button
            key={option.value}
            variant={activePeriod === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => handlePeriodClick(option.value)}
            className={`
              transition-all duration-200 text-xs
              ${activePeriod === option.value 
                ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500' 
                : 'border-blue-600/30 text-blue-200 hover:bg-blue-500/20 hover:border-blue-500/50'
              }
            `}
          >
            {option.icon}
            {option.label}
          </Button>
        ))}
      </div>

      {/* Seletor personalizado */}
      <Select
        value={activePeriod === "custom" ? "custom" : ""}
        onValueChange={(value) => value === "custom" && handlePeriodClick("custom")}
      >
        <SelectTrigger 
          className={`
            w-[140px] text-xs
            ${activePeriod === "custom" 
              ? 'border-blue-500 bg-blue-600/20' 
              : 'border-blue-600/30 hover:border-blue-500/50'
            }
          `}
        >
          <SelectValue placeholder="Personalizado" />
        </SelectTrigger>
        <SelectContent className="bg-slate-900/95 border-blue-600/30">
          <SelectItem value="custom" className="text-blue-100 hover:bg-blue-500/20">
            {activePeriod === "custom" && dateRange ? formatDateRange() : "Escolher período"}
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Date Range Picker */}
      {datePickerOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute z-50 mt-2"
        >
          <DatePickerWithRange
            date={dateRange}
            setDate={(range) => {
              onDateRangeChange(range);
              if (range?.from && range?.to) {
                setDatePickerOpen(false);
              }
            }}
          />
        </motion.div>
      )}

      {/* Toggle Tempo Real */}
      <div className="flex items-center gap-2 ml-auto">
        <span className="text-xs text-blue-200/70 dark:text-blue-300/70">
          Tempo Real:
        </span>
        <Button
          variant={isRealTime ? "default" : "outline"}
          size="sm"
          onClick={() => onToggleRealTime(!isRealTime)}
          className={`
            transition-all duration-200 text-xs
            ${isRealTime 
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500' 
              : 'border-blue-600/30 text-blue-200 hover:bg-blue-500/20'
            }
          `}
        >
          <div className={`w-2 h-2 rounded-full mr-2 ${isRealTime ? 'bg-white animate-pulse' : 'bg-blue-400'}`} />
          {isRealTime ? "Ativo" : "Inativo"}
        </Button>
      </div>

      {/* Badge com período ativo */}
      {activePeriod !== "custom" && (
        <Badge 
          variant="secondary" 
          className="ml-2 bg-blue-800/30 text-blue-200 border-blue-600/30"
        >
          {PERIOD_OPTIONS.find(opt => opt.value === activePeriod)?.label}
        </Badge>
      )}

      {/* Badge com range customizado */}
      {activePeriod === "custom" && dateRange && (
        <Badge 
          variant="secondary" 
          className="ml-2 bg-cyan-800/30 text-cyan-200 border-cyan-600/30 font-mono text-xs"
        >
          {formatDateRange()}
        </Badge>
      )}
    </motion.div>
  );
} 
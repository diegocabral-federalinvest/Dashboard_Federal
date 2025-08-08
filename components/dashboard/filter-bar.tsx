"use client";

import { useState, useEffect } from "react";
import { Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

export interface FilterBarProps {
  period?: string;
  onPeriodChange?: (period: string) => void;
  className?: string;
}

export function FilterBar({ 
  period = "month", 
  onPeriodChange,
  className = "" 
}: FilterBarProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  
  // Update local state when period prop changes
  useEffect(() => {
    setSelectedPeriod(period);
  }, [period]);

  const handlePeriodChange = (newPeriod: string) => {
    setSelectedPeriod(newPeriod);
    if (onPeriodChange) {
      onPeriodChange(newPeriod);
    }
  };

  const getPeriodLabel = (periodValue: string) => {
    switch (periodValue) {
      case "day": return "Hoje";
      case "week": return "Esta semana";
      case "month": return "Este mês";
      case "quarter": return "Este trimestre";
      case "year": return "Este ano";
      case "all": return "Todo período";
      default: return "Este mês";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`mb-4 ${className}`}
    >
      <Card className="p-2 flex flex-wrap items-center justify-between gap-2 border-none bg-muted/30 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                <Calendar className="h-3.5 w-3.5" />
                <span>{getPeriodLabel(selectedPeriod)}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => handlePeriodChange("day")}>
                Hoje
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePeriodChange("week")}>
                Esta semana
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePeriodChange("month")}>
                Este mês
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePeriodChange("quarter")}>
                Este trimestre
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePeriodChange("year")}>
                Este ano
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePeriodChange("all")}>
                Todo período
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
            <Filter className="h-3.5 w-3.5 mr-1" />
            <span>Filtros</span>
          </Button>
        </div>
      </Card>
    </motion.div>
  );
} 
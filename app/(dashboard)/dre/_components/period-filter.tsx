"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useSaveTaxDeduction } from "@/features/finance/api/use-save-tax-deduction";
import { useGetTaxDeduction } from "@/features/finance/api/use-get-tax-deduction";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Period } from "@/features/finance/types";

interface PeriodFilterProps {
  periodType: "monthly" | "quarterly" | "annual";
  currentPeriod: Period;
  onPeriodChange: (period: Period) => void;
  estimatedTaxes?: {
    irpj: number;
    csll: number;
  };
}

// Meses do ano para o seletor
const months = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

// Trimestres para o seletor
const quarters = [
  { value: 1, label: "1º Trimestre (Jan-Mar)" },
  { value: 2, label: "2º Trimestre (Abr-Jun)" },
  { value: 3, label: "3º Trimestre (Jul-Set)" },
  { value: 4, label: "4º Trimestre (Out-Dez)" },
];

// Gerar anos (do atual até 5 anos atrás)
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  
  for (let i = 0; i < 6; i++) {
    const year = currentYear - i;
    years.push({ value: year, label: year.toString() });
  }
  
  return years;
};

export const PeriodFilter: React.FC<PeriodFilterProps> = ({
  periodType,
  currentPeriod,
  onPeriodChange,
  estimatedTaxes
}) => {
  // Sync local state with props
  const [localState, setLocalState] = useState({
    year: currentPeriod.year,
    quarter: currentPeriod.quarter || 1,
    month: currentPeriod.month || 1,
    deducaoFiscal: currentPeriod.deducaoFiscal || 0
  });
  
  const [taxDeductionDialog, setTaxDeductionDialog] = useState(false);
  
  // Dados de dedução fiscal do trimestre
  const { data: taxDeduction } = useGetTaxDeduction({
    year: localState.year || new Date().getFullYear(), // Fallback se year for null
    quarter: periodType === 'quarterly' ? localState.quarter : 1,
  });
  
  // Update fiscal deduction when tax data is loaded
  useEffect(() => {
    if (periodType === 'quarterly' && taxDeduction && taxDeduction.value !== undefined) {
      setLocalState(prev => ({
        ...prev,
        deducaoFiscal: taxDeduction.value
      }));
    }
  }, [taxDeduction, periodType]);
  
  // Update local state when props change (but only when they actually change)
  useEffect(() => {
    const shouldUpdate = 
      currentPeriod.year !== localState.year ||
      (currentPeriod.quarter !== localState.quarter && currentPeriod.quarter !== undefined) ||
      (currentPeriod.month !== localState.month && currentPeriod.month !== undefined) ||
      (currentPeriod.deducaoFiscal !== localState.deducaoFiscal && currentPeriod.deducaoFiscal !== undefined);
      
    if (shouldUpdate) {
      setLocalState({
        year: currentPeriod.year,
        quarter: currentPeriod.quarter || localState.quarter,
        month: currentPeriod.month || localState.month,
        deducaoFiscal: currentPeriod.deducaoFiscal !== undefined ? currentPeriod.deducaoFiscal : localState.deducaoFiscal
      });
    }
  }, [currentPeriod, localState.year, localState.quarter, localState.month, localState.deducaoFiscal]);
  
  // Tax savings calculation
  const taxSavings = useMemo(() => {
    if (!estimatedTaxes || localState.deducaoFiscal <= 0) return 0;
    
    // With deduction for quarterly periods
    const noDeductionIRPJ = Math.max(0, (estimatedTaxes.irpj + localState.deducaoFiscal) * 0.15);
    const noDeductionCSLL = Math.max(0, (estimatedTaxes.csll + localState.deducaoFiscal) * 0.09);
    
    return Math.max(0, (noDeductionIRPJ - estimatedTaxes.irpj) + (noDeductionCSLL - estimatedTaxes.csll));
  }, [estimatedTaxes, localState.deducaoFiscal]);
  
  // Available years (5 years from current)
  const availableYears = useMemo(() => {
    return generateYearOptions();
  }, []);
  
  // Mutation para salvar dedução fiscal
  const { mutate: saveTaxDeduction } = useSaveTaxDeduction();
  
  // Handler for year change
  const handleYearChange = (value: string) => {
    const newYear = Number(value);
    
    // Update local state
    setLocalState(prev => ({
      ...prev,
      year: newYear
    }));
    
    // Notify parent component
    onPeriodChange({
      year: newYear,
      quarter: periodType === 'quarterly' ? localState.quarter : undefined,
      month: periodType === 'monthly' ? localState.month : undefined,
      deducaoFiscal: periodType === 'quarterly' ? localState.deducaoFiscal : 0,
      periodType
    });
  };
  
  // Handler for quarter change
  const handleQuarterChange = (value: string) => {
    const newQuarter = Number(value);
    
    // Update local state
    setLocalState(prev => ({
      ...prev,
      quarter: newQuarter
    }));
    
    // Notify parent component
    onPeriodChange({
      year: localState.year,
      quarter: newQuarter,
      deducaoFiscal: localState.deducaoFiscal,
      periodType: "quarterly"
    });
  };
  
  // Handler for month change
  const handleMonthChange = (value: string) => {
    const newMonth = Number(value);
    
    // Update local state
    setLocalState(prev => ({
      ...prev,
      month: newMonth
    }));
    
    // Notify parent component
    onPeriodChange({
      year: localState.year,
      month: newMonth,
      periodType: "monthly"
    });
  };
  
  // Save tax deduction
  const handleSaveTaxDeduction = () => {
    saveTaxDeduction({
      year: localState.year || new Date().getFullYear(), // Fallback se year for null
      quarter: localState.quarter,
      value: localState.deducaoFiscal
    }, {
      onSuccess: () => {
        // Also update the parent state
        onPeriodChange({
          year: localState.year,
          quarter: periodType === 'quarterly' ? localState.quarter : undefined,
          month: periodType === 'monthly' ? localState.month : undefined,
          deducaoFiscal: localState.deducaoFiscal,
          periodType
        });
        setTaxDeductionDialog(false);
      }
    });
  };
  
  return (
    <div className="flex flex-col md:flex-row gap-2 min-h-[42px]">
      {/* Ano - sempre visível */}
      <div>
        <Select
          value={localState.year?.toString() || "all"}
          onValueChange={handleYearChange}
        >
          <SelectTrigger className="w-[115px]">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map((yearOption) => (
              <SelectItem key={yearOption.value} value={yearOption.value.toString()}>
                {yearOption.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Mês - visível apenas quando periodType é "monthly" */}
      {periodType === "monthly" && (
        <div>
          <Select
            value={localState.month.toString()}
            onValueChange={handleMonthChange}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {months.map((monthOption) => (
                <SelectItem key={monthOption.value} value={monthOption.value.toString()}>
                  {monthOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {/* Trimestre - visível apenas quando periodType é "quarterly" */}
      {periodType === "quarterly" && (
        <div className="flex flex-col md:flex-row items-center gap-2">
          <Select
            value={localState.quarter.toString()}
            onValueChange={handleQuarterChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trimestre" />
            </SelectTrigger>
            <SelectContent>
              {quarters.map((quarterOption) => (
                <SelectItem key={quarterOption.value} value={quarterOption.value.toString()}>
                  {quarterOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
        
        </div>
      )}
    </div>
  );
}; 
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DREData } from "@/features/finance/api/use-get-dre";
import { formatCurrency } from "@/lib/utils";
import { useSaveTaxDeduction } from "@/features/finance/api/use-save-tax-deduction";
import { useSaveDREResults } from "@/features/finance/api/use-save-dre-results";
import { useQueryClient } from "@tanstack/react-query";
import logger from "@/lib/logger";
import { Period } from "@/features/finance/types";
import { invalidateDRECache } from "@/lib/storage/cache-utils";

interface TaxDeductionDialogProps {
  year: number;
  quarter?: number;
  currentValue: number;
  onDeductionChange: (value: number) => void;
  period: Period;
  dreData: DREData | null;
}

export const TaxDeductionDialog: React.FC<TaxDeductionDialogProps> = ({
  year,
  quarter,
  currentValue,
  onDeductionChange,
  period,
  dreData,
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(currentValue.toString());
  const [isValidValue, setIsValidValue] = useState(true);
  const queryClient = useQueryClient();
  
  const {
    mutate: saveTaxDeduction,
    isPending: isSaving,
    error: saveError
  } = useSaveTaxDeduction({
    onSuccess: () => {
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["dre"] });
    }
  });
  
  const {
    mutate: saveDREResults,
    isPending: isSavingDRE,
    error: saveDREError
  } = useSaveDREResults({
    onSuccess: () => {
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["dre"] });
    }
  });
  
  useEffect(() => {
    setValue(currentValue.toString());
  }, [currentValue]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);
    
    const isValid = /^[0-9]*\.?[0-9]*$/.test(val) && !isNaN(Number(val));
    setIsValidValue(isValid);
  };
  
  const handleSave = () => {
    if (!isValidValue) return;
    
    const numericValue = Number(value);
    
    onDeductionChange(numericValue);
    
    if (quarter && year && dreData) {
      logger.debug("Iniciando salvamento da dedução fiscal", {
        source: "frontend",
        context: "tax-deduction-dialog",
        data: {
          year,
          quarter,
          value: numericValue
        }
      });
      
      saveTaxDeduction({
        year,
        quarter,
        value: numericValue,
      });
      
      if (dreData) {
        const updatedDREData = {
          ...dreData,
          deducaoFiscal: numericValue,
          receitas: {
            ...dreData.receitas,
            total: dreData.receitas.total
          }
        };
        
        const resultadoBruto = dreData.resultadoBruto;
        const baseCalculo = Math.max(0, resultadoBruto - numericValue);
        
        updatedDREData.impostos.ir = baseCalculo * 0.15;
        updatedDREData.impostos.csll = baseCalculo * 0.09;
        updatedDREData.impostos.total = 
          updatedDREData.impostos.pis + 
          updatedDREData.impostos.cofins + 
          updatedDREData.impostos.issqn + 
          updatedDREData.impostos.ir + 
          updatedDREData.impostos.csll;
        
        updatedDREData.resultadoLiquido = 
          updatedDREData.resultadoOperacional + 
          updatedDREData.receitas.outras - 
          updatedDREData.impostos.ir - 
          updatedDREData.impostos.csll;
        
        saveDREResults({
          year,
          quarter,
          dreData: updatedDREData
        });
        
        invalidateDRECache();
      }
    }
  };
  
  const formattedValue = useMemo(() => formatCurrency(currentValue), [currentValue]);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 text-blue-600 px-0">
          <Calculator className="h-4 w-4" />
          <span>Dedução PIS/COFINS: {formattedValue}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Dedução PIS/COFINS
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-600">
            Informe o valor da dedução PIS/COFINS para o {quarter ? `${quarter}º trimestre` : `mês ${period.month}`} de {year}.
          </p>
          <div className="space-y-2">
            <Input 
              id="deduction"
              value={value}
              onChange={handleChange}
              placeholder="0,00"
              className={!isValidValue ? "border-red-500" : ""}
              disabled={isSaving || isSavingDRE}
            />
            {!isValidValue && (
              <p className="text-xs text-red-500">Digite um valor numérico válido.</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSave} 
            disabled={!isValidValue || isSaving || isSavingDRE}
          >
            {isSaving || isSavingDRE ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
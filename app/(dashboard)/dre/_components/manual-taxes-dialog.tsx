"use client";

import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Calculator, TrendingDown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ManualTaxesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  year: number;
  quarter: number;
  currentCsll: number;
  currentIrpj: number;
  resultadoBruto: number;
  onSave: (csll: number, irpj: number) => Promise<void>;
}

export function ManualTaxesDialog({
  open,
  onOpenChange,
  year,
  quarter,
  currentCsll,
  currentIrpj,
  resultadoBruto,
  onSave
}: ManualTaxesDialogProps) {
  const [csll, setCsll] = useState(currentCsll);
  const [irpj, setIrpj] = useState(currentIrpj);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Atualizar valores quando mudar o período ou abrir o modal
  useEffect(() => {
    setCsll(currentCsll);
    setIrpj(currentIrpj);
  }, [currentCsll, currentIrpj, open]);

  // Calcular valores automáticos para comparação
  const automaticCsll = Math.max(0, resultadoBruto * 0.09);
  const automaticIrpj = Math.max(0, resultadoBruto * 0.15);
  const totalManual = csll + irpj;
  const totalAutomatic = automaticCsll + automaticIrpj;
  const savings = totalAutomatic - totalManual;

  const quarters = [
    "1º Trimestre (Jan-Mar)",
    "2º Trimestre (Abr-Jun)",
    "3º Trimestre (Jul-Set)",
    "4º Trimestre (Out-Dez)"
  ];

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(csll, irpj);
      toast({
        title: "Impostos salvos",
        description: "CSLL e IRPJ foram atualizados com sucesso."
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os impostos. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseAutomatic = () => {
    setCsll(automaticCsll);
    setIrpj(automaticIrpj);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Impostos Manuais - CSLL e IRPJ
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {quarters[quarter - 1]} de {year}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Configure os valores de CSLL e IRPJ manualmente ou use o cálculo automático.
            </p>
          </div>

          <div className="space-y-4">
            {/* CSLL Input */}
            <div className="space-y-2">
              <Label htmlFor="csll" className="text-sm font-medium">
                CSLL (Contribuição Social sobre Lucro Líquido)
              </Label>
              <Input
                id="csll"
                type="number"
                value={csll}
                onChange={(e) => setCsll(Number(e.target.value))}
                min="0"
                step="0.01"
                placeholder="0,00"
                className="border-blue-200 dark:border-blue-800"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Valor automático (9%): {formatCurrency(automaticCsll)}
              </p>
            </div>

            {/* IRPJ Input */}
            <div className="space-y-2">
              <Label htmlFor="irpj" className="text-sm font-medium">
                IRPJ (Imposto de Renda Pessoa Jurídica)
              </Label>
              <Input
                id="irpj"
                type="number"
                value={irpj}
                onChange={(e) => setIrpj(Number(e.target.value))}
                min="0"
                step="0.01"
                placeholder="0,00"
                className="border-blue-200 dark:border-blue-800"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Valor automático (15%): {formatCurrency(automaticIrpj)}
              </p>
            </div>
          </div>

          {/* Comparação e economia */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Manual:</span>
                <span className="font-semibold">{formatCurrency(totalManual)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Automático:</span>
                <span className="text-gray-500">{formatCurrency(totalAutomatic)}</span>
              </div>
              {savings !== 0 && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className={savings > 0 ? "text-green-600" : "text-red-600"}>
                      {savings > 0 ? "Economia:" : "Acréscimo:"}
                    </span>
                    <span className={`font-semibold ${savings > 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(Math.abs(savings))}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Alerta informativo */}
          <Alert>
            <TrendingDown className="h-4 w-4" />
            <AlertDescription>
              Os valores manuais de CSLL e IRPJ sobrescreverão o cálculo automático.
              Resultado Bruto atual: {formatCurrency(resultadoBruto)}
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleUseAutomatic}
            disabled={isLoading}
          >
            Usar Cálculo Automático
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Salvar Impostos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

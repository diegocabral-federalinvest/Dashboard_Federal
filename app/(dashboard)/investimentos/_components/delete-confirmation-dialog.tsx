"use client";

import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Investment, InvestmentCalculation } from "../_types";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  investments: InvestmentCalculation[];
  isLoading?: boolean;
  type: "single" | "bulk";
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  investments,
  isLoading = false,
  type = "single",
}: DeleteConfirmationDialogProps) {
  
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      // Erro será tratado no componente pai
      console.error("Erro ao deletar investimento(s):", error);
    }
  };

  const totalValue = investments.reduce((sum, inv) => sum + inv.aporte, 0);
  const uniqueInvestors = new Set(investments.map(inv => inv.investorName)).size;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Confirmar Exclusão
          </DialogTitle>
          <DialogDescription>
            {type === "single" 
              ? "Esta ação não pode ser desfeita. O investimento será permanentemente removido."
              : "Esta ação não pode ser desfeita. Os investimentos selecionados serão permanentemente removidos."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resumo da exclusão */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-red-800 dark:text-red-200">
                  {type === "single" ? "Investimento a ser excluído:" : "Investimentos a serem excluídos:"}
                </span>
                <Badge variant="destructive" className="text-xs">
                  {investments.length} {investments.length === 1 ? 'item' : 'itens'}
                </Badge>
              </div>
              
              <div className="text-sm text-red-700 dark:text-red-300 space-y-1">
                <div className="flex justify-between">
                  <span>Valor total:</span>
                  <span className="font-medium">{formatCurrency(totalValue)}</span>
                </div>
                
                {type === "bulk" && (
                  <div className="flex justify-between">
                    <span>Investidores afetados:</span>
                    <span className="font-medium">{uniqueInvestors}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lista de investimentos (máximo 5 exibidos) */}
          <div className="max-h-40 overflow-y-auto space-y-2">
            {investments.slice(0, 5).map((investment) => (
              <div
                key={investment.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {investment.investorName}
                    </span>
                    <Badge 
                      variant={investment.aporte > 0 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {investment.aporte > 0 ? "Aporte" : "Retirada"}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(investment.date)}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-medium text-sm ${
                    investment.aporte > 0 
                      ? "text-green-600 dark:text-green-400" 
                      : "text-red-600 dark:text-red-400"
                  }`}>
                    {formatCurrency(investment.aporte)}
                  </div>
                </div>
              </div>
            ))}
            
            {investments.length > 5 && (
              <div className="text-center py-2 text-sm text-gray-500 dark:text-gray-400">
                ... e mais {investments.length - 5} investimento(s)
              </div>
            )}
          </div>

          {/* Aviso sobre impacto nos cálculos */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <p className="font-medium mb-1">Atenção:</p>
                <p>
                  {type === "single" 
                    ? "A exclusão deste investimento irá recalcular automaticamente os rendimentos e saldos dos períodos subsequentes."
                    : "A exclusão destes investimentos irá recalcular automaticamente os rendimentos e saldos de todos os períodos afetados."
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir {type === "single" ? "Investimento" : `${investments.length} Itens`}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Investor, DialogState } from "../_types";

interface NewInvestmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investors: Investor[];
  dialogState: DialogState;
  updateDialogField: (field: keyof DialogState, value: any) => void;
  onSave: () => void;
  isLoading?: boolean;
}

export function NewInvestmentDialog({
  open,
  onOpenChange,
  investors,
  dialogState,
  updateDialogField,
  onSave,
  isLoading = false
}: NewInvestmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Investimento</DialogTitle>
          <DialogDescription>
            Adicione um novo investimento ao sistema
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="investor">Investidor</Label>
            <Select 
              value={dialogState.selectedInvestor} 
              onValueChange={(value) => updateDialogField('selectedInvestor', value)}
            >
              <SelectTrigger id="investor">
                <SelectValue placeholder="Selecione um investidor" />
              </SelectTrigger>
              <SelectContent>
                {investors.length === 0 ? (
                  <SelectItem value="none" disabled>Nenhum investidor cadastrado</SelectItem>
                ) : (
                  investors.map((investor) => (
                    <SelectItem key={investor.id} value={investor.id}>
                      {investor.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="amount">Valor do Investimento</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0,00"
              value={dialogState.investmentAmount}
              onChange={(e) => updateDialogField('investmentAmount', e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label>Data do Investimento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !dialogState.selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dialogState.selectedDate ? format(dialogState.selectedDate, "PPP", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dialogState.selectedDate}
                  onSelect={(date) => updateDialogField('selectedDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={onSave}
            disabled={!dialogState.selectedInvestor || !dialogState.investmentAmount || !dialogState.selectedDate || isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-300 dark:border-gray-700 mr-2"></div>
                Salvando...
              </>
            ) : (
              "Salvar Investimento"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
"use client";

import { useState, useEffect } from "react";
import { Calendar, DollarSign, User, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Investment, Investor } from "../_types";
import { toast } from "sonner";

interface EditInvestmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  investment: Investment | null;
  investors: Investor[];
  onSave: (updatedInvestment: Partial<Investment>) => Promise<void>;
  isLoading?: boolean;
}

export function EditInvestmentDialog({
  isOpen,
  onClose,
  investment,
  investors,
  onSave,
  isLoading = false,
}: EditInvestmentDialogProps) {
  const [formData, setFormData] = useState<{
    investorId: string;
    value: string;
    type: "aporte" | "retirada";
    date: Date;
    description: string;
  }>({
    investorId: "",
    value: "",
    type: "aporte",
    date: new Date(),
    description: "",
  });
  
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Preencher formulário quando investimento for carregado
  useEffect(() => {
    if (investment) {
      setFormData({
        investorId: investment.investorId,
        value: investment.value.toString(),
        type: investment.type,
        date: new Date(investment.date),
        description: investment.description || "",
      });
    }
  }, [investment]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        investorId: "",
        value: "",
        type: "aporte",
        date: new Date(),
        description: "",
      });
      setIsSaving(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!investment) return;

    // Validações
    if (!formData.investorId) {
      toast.error("Selecione um investidor");
      return;
    }
    
    if (!formData.value || parseFloat(formData.value) <= 0) {
      toast.error("Valor deve ser maior que zero");
      return;
    }

    setIsSaving(true);
    
    try {
      const updatedData: Partial<Investment> = {
        investorId: formData.investorId,
        value: parseFloat(formData.value),
        type: formData.type,
        date: format(formData.date, "yyyy-MM-dd"),
        description: formData.description,
      };

      await onSave(updatedData);
      
      toast.success("Investimento atualizado com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar investimento:", error);
      toast.error("Erro ao atualizar investimento");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedInvestor = investors.find(inv => inv.id === formData.investorId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-500" />
            Editar Investimento
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Investidor */}
          <div className="space-y-2">
            <Label htmlFor="investor" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Investidor
            </Label>
            <Select
              value={formData.investorId}
              onValueChange={(value) =>
                setFormData(prev => ({ ...prev, investorId: value }))
              }
              disabled={isLoading || isSaving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um investidor" />
              </SelectTrigger>
              <SelectContent>
                {investors.map((investor) => (
                  <SelectItem key={investor.id} value={investor.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{investor.name}</span>
                      <span className="text-sm text-gray-500">({investor.id.slice(-4)})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedInvestor && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedInvestor.email} • {selectedInvestor.phone}
              </p>
            )}
          </div>

          {/* Tipo e Valor */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Operação</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "aporte" | "retirada") =>
                  setFormData(prev => ({ ...prev, type: value }))
                }
                disabled={isLoading || isSaving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aporte">
                    <span className="text-green-600 font-medium">Aporte</span>
                  </SelectItem>
                  <SelectItem value="retirada">
                    <span className="text-red-600 font-medium">Retirada</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Valor (R$)</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                min="0"
                placeholder="Digite o valor"
                value={formData.value}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, value: e.target.value }))
                }
                disabled={isLoading || isSaving}
                className="text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          {/* Data */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Data da Operação
            </Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date && "text-muted-foreground"
                  )}
                  disabled={isLoading || isSaving}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {formData.date ? (
                    format(formData.date, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecionar data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => {
                    if (date) {
                      setFormData(prev => ({ ...prev, date }));
                      setCalendarOpen(false);
                    }
                  }}
                  disabled={(date) => 
                    date > new Date() || date < new Date("2020-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Input
              id="description"
              placeholder="Ex: Aporte mensal de janeiro"
              value={formData.description}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, description: e.target.value }))
              }
              disabled={isLoading || isSaving}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !formData.investorId || !formData.value}
              className="min-w-[100px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CalendarIcon, Trash } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DEFAULT_DAILY_RATE } from "../hooks/use-investment-return";
import { Investment } from "../api/use-get-investment";
import { useGetInvestors } from "../api/use-get-investors";
import { Skeleton } from "@/components/ui/skeleton";

// Esquema de validação do formulário usando zod - SIMPLIFICADO
const formSchema = z.object({
  value: z.coerce
    .number()
    .positive("O valor deve ser maior que zero")
    .min(1, "O valor mínimo é R$ 1,00"),
  type: z.enum(["aporte", "retirada"], {
    required_error: "O tipo de operação é obrigatório",
  }),
  investorId: z.string().min(1, "Selecione um investidor"),
  date: z.coerce.date(),
});

type FormValues = z.infer<typeof formSchema>;

interface InvestmentFormProps {
  defaultValues?: Partial<FormValues>;
  onSubmit: (data: FormValues) => void;
  onDelete?: () => void;
  isLoading?: boolean;
  investment?: Investment;
}

export function InvestmentForm({
  defaultValues,
  onSubmit,
  onDelete,
  isLoading = false,
  investment,
}: InvestmentFormProps) {
  // Buscar lista de investidores
  const { data: investors, isLoading: isLoadingInvestors } = useGetInvestors();

  // Inicializar o formulário com defaultValues ou valores vazios
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: 0,
      type: "aporte",
      investorId: "",
      date: new Date(),
      ...defaultValues,
    },
  });

  // Preencher o formulário se um investimento for fornecido
  useEffect(() => {
    if (investment) {
      const formValues: Partial<FormValues> = {
        value: typeof investment.value === "string" 
          ? parseFloat(investment.value) 
          : investment.value,
        type: (investment as any).type || "aporte", // Default para aporte se não existir
        investorId: investment.investorId,
      };

      // Converter strings de data para objetos Date
      if (investment.date) {
        formValues.date = new Date(investment.date);
      }

      // Resetar o form com os valores do investimento
      form.reset(formValues);
    }
  }, [investment, form]);

  // Enviar o formulário
  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
  };

  const handleDelete = () => {
    onDelete?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Switch para Aporte/Retirada */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Tipo de Operação
                </FormLabel>
                <FormDescription>
                  {field.value === "aporte" 
                    ? "💰 Aporte - Adiciona valor ao investimento" 
                    : "📤 Retirada - Remove valor do investimento"}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value === "retirada"}
                  onCheckedChange={(checked) => 
                    field.onChange(checked ? "retirada" : "aporte")
                  }
                  disabled={isLoading}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Layout Vertical - Campos um embaixo do outro */}
        <div className="space-y-6">
          {/* Select de Investidor */}
          <FormField
            control={form.control}
            name="investorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Investidor</FormLabel>
                <FormControl>
                  {isLoadingInvestors ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoading || isLoadingInvestors}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um investidor" />
                      </SelectTrigger>
                      <SelectContent>
                        {investors?.map((investor) => (
                          <SelectItem key={investor.id} value={investor.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{investor.name}</span>
                              <span className="text-xs text-muted-foreground">{investor.email}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Valor */}
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor (R$)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Data */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data do Aporte/Retirada</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isLoading}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      locale={ptBR}
                      disabled={isLoading}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Processando..." : investment ? "Atualizar Investimento" : "Criar Investimento"}
        </Button>

        {investment && onDelete && (
          <Button
            type="button"
            disabled={isLoading}
            onClick={handleDelete}
            className="w-full"
            variant="outline"
          >
            <Trash className="size-4 mr-2" />
            Deletar Investimento
          </Button>
        )}
      </form>
    </Form>
  );
} 
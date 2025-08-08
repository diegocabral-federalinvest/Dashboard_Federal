import { z } from "zod";
import { Trash, CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { insertExpenseSchema } from "@/db/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

// Importar categorias das constantes globais
const EXPENSE_CATEGORIES_ARRAY = [
  { id: "operacional", name: "Operacional", description: "Despesas de funcionamento do negócio" },
  { id: "marketing", name: "Marketing", description: "Publicidade e promoção" },
  { id: "folha", name: "Folha de Pagamento", description: "Salários e encargos trabalhistas" },
  { id: "impostos", name: "Impostos e Taxas", description: "Tributos e taxas governamentais" },
  { id: "aluguel", name: "Aluguel", description: "Locação de imóveis e equipamentos" },
  { id: "servicos", name: "Serviços", description: "Prestação de serviços terceirizados" },
  { id: "material", name: "Material", description: "Materiais de consumo e escritório" },
  { id: "tecnologia", name: "Tecnologia", description: "Software, hardware e TI" },
  { id: "viagem", name: "Viagem", description: "Despesas de viagem e hospedagem" },
  { id: "juridico", name: "Jurídico", description: "Serviços jurídicos e contábeis" },
  { id: "manutencao", name: "Manutenção", description: "Reparos e manutenção" },
  { id: "outros", name: "Outros", description: "Outras despesas não categorizadas" }
];

const formSchema = insertExpenseSchema.pick({
  value: true,
  description: true,
  date: true,
  isTaxable: true,
  isPayroll: true,
}).extend({
  categoryId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  id?: string;
  defaultValues?: FormValues;
  onSubmit: (values: FormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
};

export const ExpenseForm = ({
  id,
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
}: Props) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      value: "0",
      description: "",
      date: new Date(),
      isTaxable: false,
      isPayroll: false,
      categoryId: "outros",
    },
  });

  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
  };

  const handleDelete = () => {
    onDelete?.();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 pt-4"
      >
        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input
                  disabled={disabled}
                  placeholder="Ex: Aluguel, Conta de luz, etc."
                  className="transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 focus:bg-gray-50 dark:focus:bg-gray-800/50 focus:ring-2 focus:ring-blue-500/20"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Container Flex para Valor e Data */}
        <div className="flex flex-row space-x-4 items-end">
          <FormField
            name="value"
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex-1 "> {/* Faz o campo ocupar espaço disponível */}
                <FormLabel>Valor (R$)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    disabled={disabled}
                    placeholder="0,00"
                    className="transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 focus:bg-gray-50 dark:focus:bg-gray-800/50 focus:ring-2 focus:ring-blue-500/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="date"
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex flex-col flex-1"> {/* Faz o campo ocupar espaço disponível */}
                <FormLabel>Data</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={`w-full pl-3 text-left font-normal ${
                          !field.value ? "text-muted-foreground" : ""
                        }`}
                        disabled={disabled}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        field.onChange(date);
                        // Fechar o popover automaticamente após selecionar a data
                        const popoverTrigger = document.querySelector('[data-state="open"]');
                        if (popoverTrigger) {
                          (popoverTrigger as HTMLElement).click();
                        }
                      }}
                      disabled={disabled}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div> {/* Fim do Container Flex */}

        <FormField
          name="categoryId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || "outros"} disabled={disabled}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EXPENSE_CATEGORIES_ARRAY.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{category.name}</span>
                        <span className="text-xs text-muted-foreground">{category.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            name="isTaxable"
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={disabled}
                    className="mr-2"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-medium">Despesa Tributável</FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Deve ser considerada no cálculo de impostos
                  </p>
                </div>
              </FormItem>
            )}
          />

          <FormField
            name="isPayroll"
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={disabled}
                    className="mr-2"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-medium">Gasto de Folha</FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Salários, encargos e benefícios trabalhistas
                  </p>
                </div>
              </FormItem>
            )}
          />
        </div>

        <Button className="w-full" disabled={disabled}>
          {id ? "Salvar Alterações" : "Criar Despesa"}
        </Button>

        {!!id && (
          <Button
            type="button"
            disabled={disabled}
            onClick={handleDelete}
            className="w-full"
            variant="outline"
          >
            <Trash className="size-4 mr-2" />
            Deletar Despesa
          </Button>
        )}
      </form>
    </Form>
  );
};

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
import { insertEntrySchema } from "@/db/schema";
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

// Categorias de entradas predefinidas
const ENTRY_CATEGORIES = [
  { id: "vendas", name: "Vendas", description: "Receitas de vendas de produtos" },
  { id: "servicos", name: "Serviços", description: "Prestação de serviços" },
  { id: "consultoria", name: "Consultoria", description: "Serviços de consultoria especializada" },
  { id: "locacao", name: "Locação", description: "Rendimentos de aluguel e locação" },
  { id: "juros", name: "Juros", description: "Rendimentos de investimentos" },
  { id: "dividendos", name: "Dividendos", description: "Dividendos e participações" },
  { id: "royalties", name: "Royalties", description: "Direitos autorais e royalties" },
  { id: "comissoes", name: "Comissões", description: "Comissões e indicações" },
  { id: "subvencoes", name: "Subvenções", description: "Auxílios e subvenções governamentais" },
  { id: "financiamento", name: "Financiamento", description: "Recursos de financiamento" },
  { id: "outros", name: "Outros", description: "Outras receitas não categorizadas" }
];

const formSchema = insertEntrySchema.pick({
  value: true,
  description: true,
  date: true,
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

export const EntryForm = ({
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
                  placeholder="Ex: Vendas, Prestação de serviços, etc."
                  className="transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 focus:bg-gray-50 dark:focus:bg-gray-800/50 focus:ring-2 focus:ring-green-500/20"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="categoryId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || "outros"} disabled={disabled}>
                <FormControl>
                  <SelectTrigger className="transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 focus:bg-gray-50 dark:focus:bg-gray-800/50">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ENTRY_CATEGORIES.map((category) => (
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
                    className="transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 focus:bg-gray-50 dark:focus:bg-gray-800/50 focus:ring-2 focus:ring-green-500/20"
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
        <Button className="w-full" disabled={disabled}>
          {id ? "Salvar Alterações" : "Criar Entrada"}
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
            Deletar Entrada
          </Button>
        )}
      </form>
    </Form>
  );
};

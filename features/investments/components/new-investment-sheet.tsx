import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useNewInvestment } from "../hooks/use-new-investment";
import { InvestmentForm } from "./investment-form";
import { z } from "zod";
import { useCreateInvestment } from "../api/use-create-investment";
import { DEFAULT_DAILY_RATE } from "../hooks/use-investment-return";

// Form schema for investment - SIMPLIFICADO
const formSchema = z.object({
  value: z.coerce.number().positive(),
  type: z.enum(["aporte", "retirada"]).default("aporte"),
  investorId: z.string().min(1),
  date: z.date(),
});

type FormValues = z.infer<typeof formSchema>;

const NewInvestmentSheet = () => {
  const { isOpen, onClose } = useNewInvestment();
  const mutation = useCreateInvestment();

  const onSubmit = (values: FormValues) => {
    // Processar valores garantindo tipos corretos
    const processedValues = {
      ...values,
      value: typeof values.value === 'string' ? parseFloat(values.value) : values.value,
      // Garantir que as datas sejam strings ISO
      date: values.date instanceof Date ? values.date.toISOString() : values.date,
      // O tipo já vem do formulário (aporte ou retirada)
      // Campos adicionais obrigatórios para CreateInvestmentData
      investorName: "", // Será preenchido pela API baseado no investorId
      startDate: values.date instanceof Date ? values.date.toISOString() : values.date,
      status: (values.type === "aporte" ? "active" : "withdrawn") as "active" | "withdrawn" | "completed",
      description: `${values.type === "aporte" ? "Aporte" : "Retirada"} realizado`,
    };

    mutation.mutate(processedValues, {
      onSuccess: () => {
        onClose();
      },
      onError: (error) => {
        console.error("❌ [NEW INVESTMENT] Erro ao criar investimento:", error);
      }
    });
  };

  // Default values for new investment
  const defaultValues = {
    value: 0,
    type: "aporte" as const,
    investorId: "",
    date: new Date(),
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Novo Investimento</SheetTitle>
          <SheetDescription>
            Cadastre um novo investimento para acompanhar seus rendimentos.
          </SheetDescription>
        </SheetHeader>
        <InvestmentForm
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          isLoading={mutation.isPending}
        />
      </SheetContent>
    </Sheet>
  );
};

export default NewInvestmentSheet; 
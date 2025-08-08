import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { InvestmentForm } from "./investment-form";
import { z } from "zod";
import { useOpenInvestment } from "../hooks/use-open-investment";
import { useGetInvestment } from "../api/use-get-investment";
import { Loader2 } from "lucide-react";
import { useUpdateInvestment } from "../api/use-update-investment";
import { useDeleteInvestment } from "../api/use-delete-investment";
import useConfirm from "@/hooks/use-confirm";

// Form schema for investment - SIMPLIFICADO
const formSchema = z.object({
  value: z.coerce.number().positive(),
  type: z.enum(["aporte", "retirada"]).default("aporte"),
  investorId: z.string().min(1),
  date: z.date(),
});

type FormValues = z.infer<typeof formSchema>;

const EditInvestmentSheet = () => {
  const { isOpen, onClose, id } = useOpenInvestment();

  const [ConfirmDialog, confirm] = useConfirm(
    "Tem certeza que deseja excluir este investimento?",
    "Esta ação não pode ser desfeita."
  );

  const investmentQuery = useGetInvestment(id);
  const updateMutation = useUpdateInvestment(id);
  const deleteMutation = useDeleteInvestment(id);

  const isPending = updateMutation.isPending || deleteMutation.isPending;
  const isLoading = investmentQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    const processedValues = {
      ...values,
      value: typeof values.value === 'string' ? parseFloat(values.value) : values.value,
    };
    
    updateMutation.mutate(processedValues, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const onDelete = async () => {
    const ok = await confirm();

    if (ok) {
      deleteMutation.mutate(undefined, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  // Default values for the form
  const defaultValues = investmentQuery.data
    ? {
        value: typeof investmentQuery.data.value === 'string' 
          ? parseFloat(investmentQuery.data.value) 
          : investmentQuery.data.value,
        type: (investmentQuery.data as any).type || "aporte",
        investorId: investmentQuery.data.investorId,
        date: investmentQuery.data.date ? new Date(investmentQuery.data.date) : new Date(),
      }
    : undefined;

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Editar Investimento</SheetTitle>
            <SheetDescription>Modifique os dados do investimento.</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <InvestmentForm
              investment={investmentQuery.data}
              defaultValues={defaultValues}
              onSubmit={onSubmit}
              isLoading={isPending}
              onDelete={onDelete}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default EditInvestmentSheet; 
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ExpenseForm } from "./expense-form";
import { insertExpenseSchema } from "@/db/schema";
import { z } from "zod";
import { useOpenExpense } from "../hooks/use-open-expense";
import { useGetExpense } from "../api/use-get-expense";
import { Loader2 } from "lucide-react";
import { useUpdateExpense } from "../api/use-update-expense";
import { useDeleteExpense } from "../api/use-delete-expense";
import useConfirm from "@/hooks/use-confirm";

const formSchema = insertExpenseSchema.pick({
  value: true,
  description: true,
  date: true,
  isTaxable: true,
});

type FormValues = z.infer<typeof formSchema>;

const EditExpenseSheet = () => {
  const { isOpen, onClose, id } = useOpenExpense();

  const [ConfirmDialog, confirm] = useConfirm(
    "Tem certeza que deseja excluir esta despesa?",
    "Esta ação não pode ser desfeita."
  );

  const expenseQuery = useGetExpense(id);
  const updateMutation = useUpdateExpense(id);
  const deleteMutation = useDeleteExpense(id);

  const isPending = updateMutation.isPending || deleteMutation.isPending;

  const isLoading = expenseQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    const processedValues = {
      ...values,
      value: parseFloat(values.value || "0"),
    };
    updateMutation.mutate(processedValues, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const onDelete = async () => {
    const ok = await confirm()

    if(ok) { 
      deleteMutation.mutate(undefined, {
        onSuccess: () => {
          onClose();
        },
      })
    }

  }

  const defaultValues = expenseQuery.data
    ? {
        id: expenseQuery.data.id,
        value: String(expenseQuery.data.value),
        description: expenseQuery.data.description,
        date: expenseQuery.data.date ? new Date(expenseQuery.data.date) : new Date(),
        isTaxable: expenseQuery.data.isTaxable,
      }
    : {
        id: "",
        value: "0",
        description: "",
        date: new Date(),
        isTaxable: false,
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4">
          <SheetHeader>
            <SheetTitle>Editar Despesa</SheetTitle>
            <SheetDescription>Modifique os dados da despesa.</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div
              className="absolute inset-0 flex items-center 
          justify-center"
            >
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <ExpenseForm
              id={id}
              onSubmit={onSubmit}
              disabled={isPending}
              defaultValues={defaultValues}
              onDelete={onDelete}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default EditExpenseSheet;

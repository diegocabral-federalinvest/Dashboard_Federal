import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useNewExpense } from "../hooks/use-new-expense";
import { ExpenseForm } from "./expense-form";
import { insertExpenseSchema } from "@/db/schema";
import { z } from "zod";
import { useCreateExpense } from "../api/use-create-expense";

const formSchema = insertExpenseSchema.pick({
  description: true,
  value: true,
  date: true,
  isTaxable: true,
  isPayroll: true,
}).extend({
  categoryId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const NewExpenseSheet = () => {
  const { isOpen, onClose } = useNewExpense();

  const mutation = useCreateExpense();

  const onSubmit = (values: FormValues) => {
    const processedValues = {
      description: values.description,
      value: parseFloat(values.value || "0"),
      date: values.date,
      isTaxable: values.isTaxable,
      isPayroll: values.isPayroll ?? false,
      categoryId: values.categoryId,
    };

    mutation.mutate(processedValues, {
        onSuccess: () => {
            onClose()
        }
    })
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4">
        <SheetHeader>
          <SheetTitle>Nova Despesa</SheetTitle>
          <SheetDescription>
            Cadastre uma nova despesa para acompanhar seus gastos.
          </SheetDescription>
        </SheetHeader>
        <ExpenseForm
          onSubmit={onSubmit}
          disabled={mutation.isPending}
          defaultValues={{
            description: "",
            value: "0",
            date: new Date(),
            isTaxable: false,
            isPayroll: false,
            categoryId: "outros",
          }}
        />
      </SheetContent>
    </Sheet>
  );
};

export default NewExpenseSheet;

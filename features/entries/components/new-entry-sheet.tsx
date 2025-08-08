import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useNewEntry } from "../hooks/use-new-entry";
import { EntryForm } from "./entry-form";
import { insertEntrySchema } from "@/db/schema";
import { z } from "zod";
import { useCreateEntry } from "../api/use-create-entry";

const formSchema = insertEntrySchema.pick({
  description: true,
  value: true,
  date: true,
});

type FormValues = z.infer<typeof formSchema>;

const NewEntrySheet = () => {
  const { isOpen, onClose } = useNewEntry();

  const mutation = useCreateEntry();

  const onSubmit = (values: FormValues) => {
    const processedValues = {
      ...values,
      value: parseFloat(values.value || "0"),
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
          <SheetTitle>Nova Entrada</SheetTitle>
          <SheetDescription>
            Cadastre uma nova entrada financeira.
          </SheetDescription>
        </SheetHeader>
        <EntryForm
          onSubmit={onSubmit}
          disabled={mutation.isPending}
          defaultValues={{
            description: "",
            value: "0",
            date: new Date(),
           
          }}
        />
      </SheetContent>
    </Sheet>
  );
};

export default NewEntrySheet; 
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { EntryForm } from "./entry-form";
import { insertEntrySchema } from "@/db/schema";
import { z } from "zod";
import { useOpenEntry } from "../hooks/use-open-entry";
import { useGetEntry } from "../api/use-get-entry";
import { Loader2 } from "lucide-react";
import { useUpdateEntry } from "../api/use-update-entry";
import { useDeleteEntry } from "../api/use-delete-entry";
import useConfirm from "@/hooks/use-confirm";

const formSchema = insertEntrySchema.pick({
  value: true,
  description: true,
  date: true,
});

type FormValues = z.infer<typeof formSchema>;

const EditEntrySheet = () => {
  const { isOpen, onClose, id } = useOpenEntry();

  const [ConfirmDialog, confirm] = useConfirm(
    "Tem certeza que deseja excluir esta entrada?",
    "Esta ação não pode ser desfeita."
  );

  const entryQuery = useGetEntry(id);
  const updateMutation = useUpdateEntry(id);
  const deleteMutation = useDeleteEntry(id);

  const isPending = updateMutation.isPending || deleteMutation.isPending;

  const isLoading = entryQuery.isLoading;

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

  const defaultValues = entryQuery.data
    ? {
        id: entryQuery.data.id,
        value: String(entryQuery.data.value),
        description: entryQuery.data.description,
        date: entryQuery.data.date ? new Date(entryQuery.data.date) : new Date(),
       
      }
    : {
        id: "",
        value: "0",
        description: "",
        date: new Date(),
       
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4">
          <SheetHeader>
            <SheetTitle>Editar Entrada</SheetTitle>
            <SheetDescription>Modifique os dados da entrada.</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div
              className="absolute inset-0 flex items-center 
          justify-center"
            >
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <EntryForm
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

export default EditEntrySheet;
